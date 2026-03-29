from markitdown import MarkItDown

from src.utils.files import save_to_file


def convert_to_md(path:str="avengers-endgame-script.pdf"):
    md = MarkItDown(enable_plugins=False)
    result = md.convert(path)
    save_to_file(path.replace('.pdf', '.md'), result.text_content)
