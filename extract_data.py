import pandas as pd
import os
import glob
import json
import re

def extract_from_excel(file_path, mapping):
    try:
        xl = pd.ExcelFile(file_path)
        sheet_name = xl.sheet_names[0]
        df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return None

    # Detect Year from path
    year_match = re.search(r"20\d{2}", file_path)
    year = int(year_match.group()) if year_match else 2024

    results = {
        "file_path": file_path,
        "year": year,
        "projekttraeger": "",
        "projekttitel": "",
        "projektnummer": "",
        "laufzeit_beginn": "",
        "laufzeit_ende": "",
        "hauptprojektstandort": "",
        "hauptindikator_name": "Anzahl der Projektteilnehmenden gesamt",
        "hauptindikator_soll": "",
        "hauptindikator_ist": "",
        "hauptindikator_erfuellung_prozent": "",
        "zielgruppe_gliner_kandidaten": "",
        "projektmassnahmen_gliner_kandidaten": "",
        "zielgruppe_beste_textstelle": "",
        "massnahmen_beste_textstelle": ""
    }

    # Helper for fuzzy search
    def fuzzy_find(label, col_offset=1):
        mask = df.astype(str).apply(lambda x: x.str.contains(re.escape(label), case=False, na=False))
        if mask.any().any():
            row, col = [(r, c) for r in range(df.shape[0]) for c in range(df.shape[1]) if mask.iloc[r, c]][0]
            if 0 <= col + col_offset < df.shape[1]:
                val = df.iloc[row, col + col_offset]
                return str(val) if pd.notna(val) else ""
        return ""

    # 1. Base Fields (Fuzzy is generally okay for these)
    results["projekttraeger"] = fuzzy_find("Projektträger")
    results["projekttitel"] = fuzzy_find("Projekttitel")
    results["projektnummer"] = fuzzy_find("Projektnummer")
    results["laufzeit_beginn"] = fuzzy_find("Laufzeit Beginn")
    results["laufzeit_ende"] = fuzzy_find("Laufzeit Ende")
    results["hauptprojektstandort"] = fuzzy_find("Haupttprojektstandort") or fuzzy_find("Hauptprojektstandort")

    # 2. States (Coordinate-based per Year)
    state_names = ["Burgenland", "Kärnten", "Niederösterreich", "Oberösterreich", "Salzburg", "Steiermark", "Tirol", "Vorarlberg", "Wien"]
    states_results = {s: "0" for s in state_names}

    if year >= 2026:
        # Pattern 2026+: Labels Col 5, Values Col 6, Rows 3-12
        for r in range(3, 13):
            if df.shape[1] > 6:
                label = str(df.iloc[r, 5]).strip()
                if label in state_names:
                    val = df.iloc[r, 6]
                    states_results[label] = str(val) if pd.notna(val) else "0"
    elif year >= 2024:
        # Pattern 2024/25: Labels Col 3, Values Col 4, Rows 12-21
        for r in range(11, 22):
            if df.shape[1] > 4:
                label = str(df.iloc[r, 3]).strip()
                if label in state_names:
                    val = df.iloc[r, 4]
                    states_results[label] = str(val) if pd.notna(val) else "0"
    elif year >= 2022:
        # Pattern 2022/23: Labels Col 10, Values Col 11?
        for r in range(3, 15):
            if df.shape[1] > 10:
                label = str(df.iloc[r, 10]).strip()
                if label in state_names:
                    val = df.iloc[r, 11] if df.shape[1] > 11 else None
                    states_results[label] = str(val) if pd.notna(val) else "marked"
    else:
        # Fallback for 2019-2021: Fuzzy checkbox search
        for s in state_names:
            mask = df.astype(str).apply(lambda x: x.str.contains(s, case=False, na=False))
            if mask.any().any():
                states_results[s] = "marked"

    results["states"] = states_results

    # 3. Indicators (Coordinate-based)
    indicator_row = -1
    search_labels = ["Anzahl der Projektteilnehmenden gesamt", "Anzahl der Teilnehmerinnen und Teilnehmer im Projekt"]
    for label in search_labels:
        mask = df.astype(str).apply(lambda x: x.str.contains(label, case=False, na=False))
        if mask.any().any():
            indicator_row = [r for r in range(df.shape[0]) if mask.iloc[r].any()][0]
            break

    if indicator_row != -1:
        if year >= 2024:
            # Col 3: Soll, Col 19: Ist? No, varies. Search headers.
            headers = df.iloc[max(0, indicator_row-4):indicator_row+1]
            for r in range(headers.shape[0]):
                for c in range(headers.shape[1]):
                    h = str(headers.iloc[r, c]).lower()
                    if "soll" in h and not results["hauptindikator_soll"]: results["hauptindikator_soll"] = str(df.iloc[indicator_row, c])
                    if "ist" in h and not results["hauptindikator_ist"]: results["hauptindikator_ist"] = str(df.iloc[indicator_row, c])
                    if ("erfüllt" in h or "%" in h) and not results["hauptindikator_erfuellung_prozent"]: results["hauptindikator_erfuellung_prozent"] = str(df.iloc[indicator_row, c])
        else:
            # 2019-2021: Col 3 Soll, Col 4 Ist
            results["hauptindikator_soll"] = str(df.iloc[indicator_row, 3]) if df.shape[1] > 3 else ""
            results["hauptindikator_ist"] = str(df.iloc[indicator_row, 4]) if df.shape[1] > 4 else ""

    # Calculate % if missing
    try:
        soll = float(results["hauptindikator_soll"])
        ist = float(results["hauptindikator_ist"])
        if soll > 0 and (not results["hauptindikator_erfuellung_prozent"] or results["hauptindikator_erfuellung_prozent"] == "nan"):
            results["hauptindikator_erfuellung_prozent"] = str(ist / soll)
    except: pass

    # 4. Text Snippets (GLiNER & Best Text)
    all_text = []
    # Collect from all sheets
    for s in xl.sheet_names:
        try:
            s_df = pd.read_excel(file_path, sheet_name=s, header=None)
            for val in s_df.values.flatten():
                if isinstance(val, str) and len(val) > 40:
                    all_text.append(val.strip())
        except: continue

    tg_keywords = ["zielgruppe", "personen", "teilnehmende", "frauen", "kinder", "asyl", "migrant"]
    m_keywords = ["maßnahme", "workshop", "kurs", "beratung", "betreuung", "veranstaltung", "stunden"]

    tg_candidates = [t for t in all_text if any(k in t.lower() for k in tg_keywords)]
    m_candidates = [t for t in all_text if any(k in t.lower() for k in m_keywords)]

    results["zielgruppe_gliner_kandidaten"] = "; ".join(list(set(tg_candidates))[:5])
    results["projektmassnahmen_gliner_kandidaten"] = "; ".join(list(set(m_candidates))[:5])
    results["zielgruppe_beste_textstelle"] = max(tg_candidates, key=len) if tg_candidates else ""
    results["massnahmen_beste_textstelle"] = max(m_candidates, key=len) if m_candidates else ""

    return results

if __name__ == "__main__":
    # Find all Indikatoren/Indikatorenbericht files
    files = glob.glob("Hackathon/**/*Indikatoren*.xlsx", recursive=True)
    all_data = []
    
    for f in files:
        if "~$" in f: continue # Ignore temp files
        print(f"Processing {f}...")
        data = extract_from_excel(f, {}) # Mapping no longer needed for internal logic
        if data:
            all_data.append(data)

    # Save to JSON
    with open("extracted_projects.json", "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=4)
    
    print(f"\nDone! Data from {len(all_data)} files saved to 'extracted_projects.json'.")
