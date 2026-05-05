# Project Integration Document Service

This project helps in uploading and bundling project integration documents, using AI to extract and categorize information.

## Quick Start with Docker

The easiest way to run the project is using Docker Compose.

### Prerequisites
- Docker and Docker Compose installed.
- A GitHub Token (for LLM features).

### Steps
1. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
2. Add your `GITHUB_TOKEN` to the `.env` file.
3. Start the application:
   ```bash
   docker-compose up --build
   ```

The application will be available at:
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:8000](http://localhost:8000)

## Development

If you want to run the components separately without Docker:

### Backend
1. Install `uv` if you haven't already.
2. Run `uv sync` to install dependencies.
3. Run `uv run api.py` to start the backend.

### Frontend
1. Install `bun` if you haven't already.
2. Go to the `app` directory: `cd app`.
3. Run `bun install`.
4. Run `bun run dev` to start the frontend.

Alternatively, use the `Makefile`:
```bash
make install
make start
```

## Project Structure
- `api.py`: FastAPI backend.
- `app/`: Frontend React application.
- `data/`: Directory where uploaded document bundles are stored.
- `extraction_pipeline/`: Logic for data extraction from documents.
