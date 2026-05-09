# Smart Data Extraction

Dieses Projekt entstand im Rahmen des [Public AI Hackathons](https://www.digitalaustria.gv.at/wissenswertes/events/publicaihackathon.html) des österreichischen Bundeskanzleramts. 

Die Challenge: Projektdaten aus einer Vielzahl historisch gewachsener Excel-Dateien und begleitender Dokumente extrahieren. Die Dateien haben sich über mehrere Jahre verändert, folgen keinem stabilen Schema und enthalten relevante Informationen an unterschiedlichen Stellen, in unterschiedlichen Tabellenblättern und teilweise in unterschiedlichen Formaten. Ziel war es, daraus strukturierte JSON-Daten zu erzeugen, die anschließend sauber visualisiert, durchsucht und analysiert werden können.

Teammitglieder: Peter Panzitt, Hannah Ertl, Tobias Reicherzer, Markus Riemer und Mathias Falzberger.

## Projektmotivation

Viele Verwaltungsprozesse arbeiten mit Excel-Dateien, die über Jahre erweitert und angepasst wurden. Für Menschen sind diese Dateien oft noch interpretierbar, für Maschinen aber nur schwer. Feldnamen, Zellpositionen, Tabellenblätter, Indikatornamen und Berichtsformate verändern sich über die Zeit. Dadurch entstehen drei zentrale Probleme:

- Eine direkte Auswertung ist fehleranfällig, weil dieselbe Information nicht immer an derselben Stelle steht.
- Manuelle Datenübertragung kostet Zeit und lässt sich nur schwer skalieren.
- Gute Visualisierungen und Analysen brauchen zuerst eine verlässliche, einheitliche Datenstruktur.

Unser Ansatz war daher, die heterogenen Quelldateien in ein gemeinsames, maschinenlesbares Format zu überführen. Die Web-App nutzt diese extrahierten JSON-Daten als Grundlage für Filter, Detailansichten und Dashboards.

## Zielgruppen und abgeleitete Use-Cases

### Verwaltungsmitarbeiter:innen und Fachabteilungen

Pain Points der aktuellen Arbeitsweise:

Projektinformationen liegen in unterschiedlichen Excel-, PDF- und DOCX-Dateien. Um einen Überblick über Träger, Projektlaufzeiten, Standorte, Zielgruppen, Maßnahmen und Indikatoren zu bekommen, müssen Dateien geöffnet, verglichen und manuell zusammengeführt werden.

Unsere abgeleiteten Use-Cases:

- Automatisierte Extraktion zentraler Projektinformationen aus uneinheitlichen Excel-Dateien.
- Bündelung projektbezogener Dokumente wie Projektbeschreibung, Endbericht, Soll-Indikatoren und Ist-Indikatoren.
- Ausgabe in einem stabilen JSON-Format für Weiterverarbeitung, Qualitätssicherung und Visualisierung.


## Lösungsansatz

Das Repository besteht aus zwei Teilen:

- `extraction/`: Die Datenextraktions-Pipeline mit Rohdaten, Notebooks, Extraktionslogik und generierten Ergebnissen.
- `webapp/`: Die Web-Anwendung mit FastAPI-Backend und React-Frontend für Upload, Suche, Detailansichten und Visualisierung.

Die Pipeline erkennt zusammengehörende Projektdokumente, extrahiert strukturierte Felder aus Excel-Dateien und sammelt Evidenz aus begleitenden Dokumenten. Die Web-App konsumiert diese JSON-Daten und macht sie für Nutzer:innen durchsuchbar und visuell erfassbar.


## Repository-Struktur

- `webapp/api.py`: FastAPI-Backend.
- `webapp/frontend/`: React-Frontend.
- `webapp/frontend/src/data/`: JSON-Daten, die direkt von der Web-App verwendet werden.
- `webapp/data/`: Hochgeladene Dokumentenbündel der Web-App.
- `extraction/Hackathon/`: Quelldaten und Masterdatenbank für die Extraktion.
- `extraction/extraction_pipeline/`: Wiederverwendbare Extraktionslogik.
- `extraction/notebooks/`: Prototypen, Batch-Extraktion und Analyse-Outputs.
- `extraction/extract_data.py`: Standalone-Skript für Excel-basierte Extraktion.



## Extraction Pipeline

Die Extraktion kann separat von der Web-App weiterentwickelt und ausgeführt werden:

```bash
python extraction/extract_data.py
```

Das Skript liest die Dateien aus `extraction/Hackathon/` und schreibt `extraction/extracted_projects.json`. Um die Web-App mit neu extrahierten Daten zu aktualisieren, muss die erzeugte JSON-Datei nach `webapp/frontend/src/data/` übernommen werden.



## Special Thanks

Vielen Dank an die Organisator:innen des Public AI Hackathons, das Bundeskanzleramt, die Challenge Owner Adrian Korbiel und Arpad Fa sowie das Bundesrechenzentrum (BRZ) für die Unterstützung und die Möglichkeit, an einer realen Verwaltungsherausforderung zu arbeiten.

## License und Open Source

Dieses Projekt wurde im Rahmen des Public AI Hackathons für die öffentliche Verwaltung entwickelt und ist als Open-Source-Projekt gedacht. Die hier bereitgestellten Konzepte und Code-Bestandteile können als Grundlage für weitere Experimente, Prototypen und Verwaltungsanwendungen genutzt werden.
