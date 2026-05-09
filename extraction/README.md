# Extraction Pipeline

This folder contains the data extraction side of the project.

- `Hackathon/`: Raw source documents and `Masterdatenbank_Integrationsprojekte_2019-2026.xlsx`.
- `extraction_pipeline/`: Python package with discovery, document parsing, Excel extraction, and result writing logic.
- `notebooks/`: Prototypes and batch extraction notebooks.
- `extract_data.py`: Standalone Excel extraction script. From the repo root, run `python extraction/extract_data.py`; from this folder, run `python extract_data.py`. It writes `extraction/extracted_projects.json`.
- `requirements.txt`: Dependencies used by the extraction notebooks and scripts.
