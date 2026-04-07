
from src.utils.md import convert_to_md


def ensure_md(path:str):
    doc_path = path.lower()

    if doc_path.endswith(".md"):
        return doc_path

    convert_to_md(path)
    return doc_path.replace(".pdf", ".md")
