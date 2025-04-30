from graphql import GraphQLError

def check_authentication(info, must_be_authenticated=True):
    user = info.context.user  # récupère automatiquement l'utilisateur de la requête
    if must_be_authenticated and not user.is_authenticated:
        raise GraphQLError("Authentication required.")
    if not must_be_authenticated and user.is_authenticated:
        raise GraphQLError("Operation not allowed for authenticated users.")
    return user





def reformat_html(html_code: str) -> str:
    """
    Reformats HTML code to improve readability by adding basic indentation
    and removes unnecessary backslashes and ALL newline characters.
    Removes ```html``` block markers and outer quotes.

    Args:
    html_code: A string containing HTML code, optionally enclosed in ```html```
    and/or outer quotes.

    Returns:
    A string containing the reformatted HTML code without any newline characters.
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

    # Remove unnecessary backslashes before quotes
    html_code = html_code.replace('\\"', '"')
    html_code = html_code.replace("\\'", "'")

    # Remove ALL newline characters
    html_code = html_code.replace('\n', '')

    # Remove extra whitespace
    import re
    html_code = re.sub(r'\s+', ' ', html_code)

    # Basic indentation
    indentation_level = 0
    indent_size = 2
    reformatted_code = ""
    i = 0
    while i < len(html_code):
        char = html_code[i]

        if char == '<':
            next_tag = html_code[i+1:i+10].lower()
            is_closing_tag = html_code[i+1] == '/'
            is_self_closing = any(next_tag.startswith(tag) for tag in ['br', 'hr', 'img', 'input', 'meta', '!doctype'])

            if is_closing_tag:
                indentation_level = max(0, indentation_level - 1)
                reformatted_code += ' ' * (indentation_level * indent_size) + char
            elif is_self_closing:
                reformatted_code += ' ' * (indentation_level * indent_size) + char
            else:
                reformatted_code += ' ' * (indentation_level * indent_size) + char
                indentation_level += 1
        else:
            reformatted_code += char
        i += 1

    return reformatted_code.strip()
