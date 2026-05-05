import os
import os
import uuid
import shutil
import asyncio
import json
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()

# Configuration
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
APP_DATA_DIR = BASE_DIR / "app" / "src" / "data"
RECORDS_FILE = APP_DATA_DIR / "records.json"

app = FastAPI(
    title="Project Integration Document Service",
    description="Service to upload and bundle project integration documents."
)

class FilterRequest(BaseModel):
    query: str

class FilterResponse(BaseModel):
    searchTerm: str = ""
    locationFilter: str = ""
    audienceFilter: str = ""
    carrierFilter: str = ""
    titleFilter: str = ""
    startDateFilter: str = ""
    endDateFilter: str = ""

@app.post("/nl-filter", response_model=FilterResponse)
async def natural_language_filter(request: FilterRequest):
    """
    Uses an LLM to parse a natural language query into structured filters.
    """
    github_token = os.environ.get("GITHUB_TOKEN")
    if not github_token:
        raise HTTPException(status_code=500, detail="GITHUB_TOKEN not found in environment.")

    client = OpenAI(
        base_url="https://models.inference.ai.azure.com",
        api_key=github_token,
    )

    # Load unique values for mapping
    carriers = set()
    titles = set()
    locations = set()

    for filename in ["records.json", "master_records.json", "extracted_projects.json"]:
        file_path = APP_DATA_DIR / filename
        if file_path.exists():
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for record in data:
                        if record.get("projekttraeger"): carriers.add(record["projekttraeger"])
                        if record.get("projekttitel"): titles.add(record["projekttitel"])
                        if record.get("hauptprojektstandort"): locations.add(record["hauptprojektstandort"])
            except Exception as e:
                print(f"Warning: Could not read {filename} for filter suggestions: {e}")

    from datetime import datetime
    today = datetime.now().strftime("%Y-%m-%d")

    prompt = f"""
    Heute ist der {today}.
    Du bist ein Assistent für die Integrationsförderung Projektdatenbank. 
    Deine Aufgabe ist es, eine natürliche Sprach-Suchanfrage eines Nutzers in ein strukturiertes JSON-Format zu übersetzen, 
    das Filter für die Datenbank enthält. Korrigiere potenzielle Rechtschreibfehler in der Eingabe.

    WICHTIG: Wenn der Nutzer einen Projektträger, einen Projekttitel oder einen Standort nennt, 
    musst du diesen auf den am besten passenden Wert aus den unten stehenden Listen mappen. 
    Wenn kein passender Wert gefunden wird, nutze die Eingabe des Nutzers (korrigiert).

    Verfügbare Projektträger (carrierFilter):
    {", ".join(sorted(list(carriers)))}

    Verfügbare Projekttitel (titleFilter):
    {", ".join(sorted(list(titles)))}

    Verfügbare Standorte (locationFilter):
    {", ".join(sorted(list(locations)))}

    Verfügbare Felder:
    - searchTerm: Allgemeine Suche nach Maßnahmen oder Inhalten.
    - locationFilter: Der Hauptstandort des Projekts.
    - audienceFilter: Die Zielgruppe (z.B. "Jugendliche", "Frauen", "Migranten").
    - carrierFilter: Der Projektträger (Organisation).
    - titleFilter: Der exakte Projekttitel.
    - startDateFilter: Das Startdatum im Format YYYY-MM-DD. Wenn der Nutzer "ab 2024" sagt, nutze 2024-01-01.
    - endDateFilter: Das Enddatum im Format YYYY-MM-DD.

    Nutzeranfrage: "{request.query}"

    Gib NUR das JSON-Objekt zurück. Felder, die nicht in der Anfrage vorkommen, sollen leere Strings sein.
    """

    try:
        response = client.beta.chat.completions.parse(
            # model="mistral-small-2503",
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Du bist ein hilfreicher Assistent, der Filter aus Nutzeranfragen extrahiert."},
                {"role": "user", "content": prompt},
            ],
            response_format=FilterResponse,
        )
        return response.choices[0].message.parsed
    except Exception as e:
        print(f"Error calling LLM: {str(e)}")
        raise HTTPException(status_code=500, detail=f"LLM processing error: {str(e)}")

@app.get("/available-records")

async def list_available_records():
    """
    Lists all JSON files available in the app/src/data directory.
    """
    json_files = list(APP_DATA_DIR.glob("*.json"))
    return [f.name for f in json_files]

@app.get("/records/{filename}")
async def get_record_content(filename: str):
    """
    Returns the content of a specific JSON file in the app/src/data directory.
    """
    file_path = APP_DATA_DIR / filename
    if not file_path.exists() or not filename.endswith(".json"):
        raise HTTPException(status_code=404, detail="Record file not found.")
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading JSON: {str(e)}")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def process_project_bundle(bundle_id: str):
    """
    Mock function for asynchronous processing of the project bundle.
    In the future, this will trigger data extraction and categorization.
    """
    print(f"[PROCESSOR] Starting processing for bundle: {bundle_id}")
    # Mock some heavy work (e.g., OCR, LLM extraction)
    await asyncio.sleep(5)
    
    # Mock data to be appended to records.json
    new_record = {
        "projektnummer": f"NEW-{bundle_id[:8]}",
        "projekttitel": f"Automatisch extrahiertes Projekt ({bundle_id[:4]})",
        "projekttraeger": "Unbekannt",
        "laufzeit_beginn": "2024-01-01",
        "laufzeit_ende": "2024-12-31",
        "hauptprojektstandort": "Wien",
        "zielgruppe_gliner_kandidaten": ["Flüchtlinge", "Jugendliche"],
        "projektmassnahmen_gliner_kandidaten": ["Deutschkurs", "Beratung"],
        "hauptindikator_name": "Teilnehmende",
        "hauptindikator_soll": 100,
        "hauptindikator_ist": 85,
        "hauptindikator_erfuellung_prozent": 85
    }

    try:
        if RECORDS_FILE.exists():
            with open(RECORDS_FILE, "r", encoding="utf-8") as f:
                records = json.load(f)
        else:
            records = []
        
        records.append(new_record)
        
        with open(RECORDS_FILE, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2, ensure_ascii=False)
            
        print(f"[PROCESSOR] Finished processing. Record added to {RECORDS_FILE}")
    except Exception as e:
        print(f"[PROCESSOR] Error updating records.json: {str(e)}")

def validate_extension(filename: str, allowed_extensions: List[str]):
    ext = filename.split('.')[-1].lower() if '.' in filename else ''
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File '{filename}' has an invalid extension. Allowed: {', '.join(allowed_extensions)}"
        )

@app.post("/upload-project")
async def upload_project(
    background_tasks: BackgroundTasks,
    project_description: UploadFile = File(..., description="Projektbeschreibung (DOCX or PDF)"),
    final_report: UploadFile = File(..., description="Inhaltlicher Endbericht (DOCX or PDF)"),
    soll_indicators: UploadFile = File(..., description="Indikatorenblatt / SOLL (XLSX)"),
    ist_indicators: UploadFile = File(..., description="Indikatorenbericht / IST (XLSX)")
):
    """
    Uploads and bundles four project documents into a single UUID-named folder.
    """
    # 1. Validation
    files = {
        "PROJECT_DESCRIPTION": project_description,
        "FINAL_REPORT": final_report,
        "SOLL_XLSX": soll_indicators,
        "IST_XLSX": ist_indicators
    }
    
    # Extensions to check
    doc_extensions = ["pdf", "docx", "doc"]
    xlsx_extensions = ["xlsx", "xls"]
    
    validate_extension(project_description.filename, doc_extensions)
    validate_extension(final_report.filename, doc_extensions)
    validate_extension(soll_indicators.filename, xlsx_extensions)
    validate_extension(ist_indicators.filename, xlsx_extensions)
    
    # 2. Bundle ID and Storage
    bundle_id = str(uuid.uuid4())
    bundle_path = DATA_DIR / bundle_id
    bundle_path.mkdir(parents=True, exist_ok=False)
    
    saved_files = []
    for key, upload_file in files.items():
        file_path = bundle_path / upload_file.filename
        try:
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(upload_file.file, buffer)
            saved_files.append({
                "category": key,
                "filename": upload_file.filename,
                "path": str(file_path)
            })
        except Exception as e:
            # Cleanup on failure
            shutil.rmtree(bundle_path)
            raise HTTPException(status_code=500, detail=f"Failed to save files: {str(e)}")
        finally:
            upload_file.file.close()

    # Trigger asynchronous processing
    background_tasks.add_task(process_project_bundle, bundle_id)

    return {
        "status": "success",
        "bundle_id": bundle_id,
        "message": f"Successfully bundled {len(saved_files)} files. Processing started in background.",
        "files": saved_files
    }

@app.get("/")
def read_root():
    return {
        "message": "Project Integration API is running.",
        "endpoints": {
            "upload": "POST /upload-project",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
