from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

from .discovery import ProjectBundle
from .documents import best_text_blocks, extract_gliner_entities, text_blocks, top_entities
from .excel import extract_indicator_kpi_dynamic, extract_project_metadata
from .models import ExtractionModels


def extract_bundle(bundle: ProjectBundle, models: ExtractionModels) -> dict:
    errors = []
    project_meta = {}
    main_kpi = {}

    report_excel = bundle.ist_excel or bundle.soll_excel
    if report_excel is None:
        errors.append("No Excel file available for metadata/KPI extraction.")
    else:
        try:
            project_meta = extract_project_metadata(report_excel, models)
        except Exception as exc:
            errors.append(f"metadata extraction failed: {type(exc).__name__}: {exc}")

        if bundle.ist_excel is not None:
            try:
                main_kpi = extract_indicator_kpi_dynamic(bundle.ist_excel, models)
            except Exception as exc:
                errors.append(f"KPI extraction failed: {type(exc).__name__}: {exc}")
        else:
            errors.append("No Indikatorenbericht/Ist Excel file available.")

    blocks = []
    entities = []
    target_group_evidence = []
    measures_evidence = []
    try:
        blocks = text_blocks([bundle.project_description, bundle.final_report])
        entities = extract_gliner_entities(blocks, models)
        target_group_evidence = best_text_blocks(
            "Zielgruppe des Projekts: Jugendliche und junge Erwachsene mit Migrationshintergrund, die eine Lehre beginnen wollen",
            blocks,
            models,
            top_k=3,
        )
        measures_evidence = best_text_blocks(
            "umzusetzende Projektmaßnahmen: Beratung, Vorqualifizierung, Deutschkurs, Workshops, Praktika, Lehrstellenvermittlung",
            blocks,
            models,
            top_k=3,
        )
    except Exception as exc:
        errors.append(f"document extraction failed: {type(exc).__name__}: {exc}")

    def meta_value(key: str):
        return project_meta.get(key, {}).get("value")

    record = {
        "project_key": bundle.key,
        "year_folder": bundle.year_folder,
        "project_number_from_filename": bundle.project_number,
        "project_number": meta_value("projektnummer"),
        "project_name": meta_value("projekttitel"),
        "organization": meta_value("projekttraeger"),
        "runtime_start": meta_value("laufzeit_beginn"),
        "runtime_end": meta_value("laufzeit_ende"),
        "region": meta_value("hauptprojektstandort"),
        "main_indicator_name": main_kpi.get("indikator"),
        "main_indicator_soll": main_kpi.get("soll"),
        "main_indicator_ist": main_kpi.get("ist"),
        "main_indicator_fulfillment_percent": main_kpi.get("erfuellung_prozent"),
        "target_group_text": target_group_evidence[0]["text"] if target_group_evidence else None,
        "measures_text": measures_evidence[0]["text"] if measures_evidence else None,
        "has_soll_excel": bundle.soll_excel is not None,
        "has_ist_excel": bundle.ist_excel is not None,
        "has_project_description": bundle.project_description is not None,
        "has_final_report": bundle.final_report is not None,
        "error_count": len(errors),
        "errors": " | ".join(errors),
    }
    evidence = {
        "bundle": bundle.as_dict(),
        "project_meta": project_meta,
        "main_kpi": main_kpi,
        "target_group_evidence": target_group_evidence,
        "measures_evidence": measures_evidence,
        "gliner_entities": entities,
    }
    return {"record": record, "evidence": evidence, "errors": errors}


def extract_bundles(
    bundles: list[ProjectBundle],
    models: ExtractionModels,
    limit: int | None = None,
) -> tuple[pd.DataFrame, list[dict]]:
    selected = bundles[:limit] if limit else bundles
    results = [extract_bundle(bundle, models) for bundle in selected]
    records = [result["record"] for result in results]
    return pd.DataFrame(records), results


def write_results(results: list[dict], output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for result in results:
        key = result["record"]["project_key"].replace(":", "_")
        path = output_dir / f"{key}_evidence.json"
        path.write_text(json.dumps(result["evidence"], ensure_ascii=False, indent=2, default=str), encoding="utf-8")
