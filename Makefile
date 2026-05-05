.PHONY: help start install

help:
	@echo "Verfügbare Befehle:"
	@echo "  make start      - Startet Backend (Python) und Frontend (Bun) gleichzeitig"
	@echo "  make install    - Installiert Python und Frontend Abhängigkeiten"

install:
	pip install -r requirements.txt
	cd app && bun install

start:
	@echo "Starte Anwendung..."
	(python api.py & cd app && bun run dev)
