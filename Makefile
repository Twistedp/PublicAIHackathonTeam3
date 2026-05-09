.PHONY: help start install

help:
	@echo "Verfügbare Befehle:"
	@echo "  make start      - Startet Backend (uv) und Frontend (Bun) gleichzeitig"
	@echo "  make install    - Installiert Python (uv) und Frontend (Bun) Abhängigkeiten"

install:
	uv sync
	cd webapp/frontend && bun install

start:
	@echo "Starte Anwendung..."
	@trap 'kill 0' INT; \
	uv run uvicorn webapp.api:app --reload --port 8000 & \
	cd webapp/frontend && bun dev --port 5173
