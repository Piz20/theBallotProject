import re

def reformat_html(html_code):
    """
    Reformates HTML code to improve readability and removes ```html``` block markers
    and outer quotes.

    Args:
        html_code: A string containing HTML code, optionally enclosed in ```html```
                   and/or outer quotes.

    Returns:
        A string containing the reformatted HTML code.
    """
    # Remove outer quotes if present
    html_code = html_code.strip()
    if (html_code.startswith('"') and html_code.endswith('"')) or \
       (html_code.startswith("'") and html_code.endswith("'")):
        html_code = html_code[1:-1].strip()

    # Remove ```html``` block markers if present (case-insensitive)
    if html_code.lower().startswith("```html"):
        html_code = html_code[len("```html"):].lstrip()
    if html_code.endswith("```"):
        html_code = html_code[:-len("```")].rstrip()

    def replace_multiline_style(match):
        content = match.group(1)
        lines = [line.strip() for line in content.strip().split('\n') if line.strip()]
        return f" style=\"{' '.join(lines)};\""

    def replace_multiline_script(match):
        content = match.group(1)
        lines = [line.strip() for line in content.strip().split('\n')]
        return f"<script>{'\n'.join(lines)}</script>"

    # Remove extra blank lines
    reformatted_code = re.sub(r'\n\s*\n', '\n', html_code)

    # Indent based on tags (simple approach)
    indentation_level = 0
    indent_size = 4
    reformatted_lines = []
    for line in reformatted_code.split('\n'):
        stripped_line = line.strip()
        if stripped_line.startswith("</"):
            indentation_level = max(0, indentation_level - 1)
        reformatted_lines.append(" " * (indentation_level * indent_size) + stripped_line)
        if stripped_line.startswith("<") and not stripped_line.startswith("</") and not stripped_line.startswith("<br") and not stripped_line.startswith("<hr") and not stripped_line.startswith("<img") and not stripped_line.startswith("<input") and not stripped_line.startswith("<meta") and not stripped_line.startswith("<!DOCTYPE"):
            indentation_level += 1

    reformatted_code = "\n".join(reformatted_lines)

    # Condense multiline style attributes
    reformatted_code = re.sub(r'style="([^"]*?\n[^"]*?)"', replace_multiline_style, reformatted_code)

    # Ensure script content is on new lines
    reformatted_code = re.sub(r'<script>(.*?)</script>', replace_multiline_script, reformatted_code, flags=re.DOTALL)

    return reformatted_code.strip()
