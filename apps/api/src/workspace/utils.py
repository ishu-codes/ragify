from pathlib import Path

from src.utils.md import convert_to_md


def ensure_md(path: str):
    doc_path = Path(path)

    if doc_path.suffix.lower() == ".md":
        return str(doc_path)

    convert_to_md(path)
    return str(doc_path.with_suffix(".md"))
