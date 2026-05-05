from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path


SUPPORTED_EXTENSIONS = {".xlsx", ".xls", ".docx", ".pdf"}


@dataclass
class ProjectBundle:
    key: str
    year_folder: str
    project_number: str
    project_slug: str
    files: list[Path] = field(default_factory=list)
    soll_excel: Path | None = None
    ist_excel: Path | None = None
    project_description: Path | None = None
    final_report: Path | None = None

    def as_dict(self) -> dict:
        return {
            "key": self.key,
            "year_folder": self.year_folder,
            "project_number": self.project_number,
            "project_slug": self.project_slug,
            "soll_excel": str(self.soll_excel) if self.soll_excel else None,
            "ist_excel": str(self.ist_excel) if self.ist_excel else None,
            "project_description": str(self.project_description) if self.project_description else None,
            "final_report": str(self.final_report) if self.final_report else None,
            "file_count": len(self.files),
        }


def _normalize_slug(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\d{4}[_ -]?\d{0,4}|\d{2,4}", " ", text)
    text = re.sub(r"(indikatorenbericht|indikatorenblatt|indikatoren|projektbeschreibung|inhaltlicher endbericht)", " ", text)
    text = re.sub(r"[^a-z0-9äöüß]+", " ", text)
    return re.sub(r"\s+", "-", text).strip("-")


def _project_number(path: Path) -> str | None:
    match = re.match(r"^(\d{2,3})[_ -]", path.name)
    return match.group(1).lstrip("0") if match else None


def _classify_files(bundle: ProjectBundle) -> None:
    for path in sorted(bundle.files):
        name = path.name.lower()
        suffix = path.suffix.lower()
        if suffix in {".xlsx", ".xls"}:
            if "indikatorenbericht" in name:
                bundle.ist_excel = path
            elif "indikatoren" in name or "indikatorenblatt" in name:
                bundle.soll_excel = path
        elif suffix in {".docx", ".pdf"}:
            if "inhaltlicher endbericht" in name or "endbericht" in name:
                bundle.final_report = path
            elif "projektbeschreibung" in name:
                bundle.project_description = path


def discover_project_bundles(root: Path) -> list[ProjectBundle]:
    root = Path(root)
    groups: dict[tuple[str, str], ProjectBundle] = {}

    for path in sorted(root.glob("*/*")):
        if not path.is_file() or path.name.startswith("~$"):
            continue
        if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue
        number = _project_number(path)
        if number is None:
            continue
        year_folder = path.parent.name
        key = (year_folder, number)
        if key not in groups:
            slug = _normalize_slug(path.stem)
            groups[key] = ProjectBundle(
                key=f"{year_folder}:{number}",
                year_folder=year_folder,
                project_number=number,
                project_slug=slug,
            )
        groups[key].files.append(path)

    bundles = list(groups.values())
    for bundle in bundles:
        _classify_files(bundle)
    return sorted(bundles, key=lambda item: (item.year_folder, int(item.project_number)))
