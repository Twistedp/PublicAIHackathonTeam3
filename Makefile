.PHONY: help start install

help:
	@echo "Verfügbare Befehle:"
	@echo "  make start      - Startet Backend (uv) und Frontend (Bun) gleichzeitig"
	@echo "  make install    - Installiert Python (uv) und Frontend (Bun) Abhängigkeiten"

install:
	uv sync
	cd app && bun install

start:
	@echo "Starte Anwendung..."
	@trap 'kill 0' INT; \
	uv run uvicorn api:app --reload --port 8000 & \
	cd app && bun dev --port 5173
