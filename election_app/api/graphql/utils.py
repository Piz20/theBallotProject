from graphql import GraphQLError

def check_authentication(info, must_be_authenticated=True):
    user = info.context.user  # récupère automatiquement l'utilisateur de la requête
    if must_be_authenticated and not user.is_authenticated:
        raise GraphQLError("Authentication required.")
    if not must_be_authenticated and user.is_authenticated:
        raise GraphQLError("Operation not allowed for authenticated users.")
    return user





def reformat_result(result: str) -> str:
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
    result = result.strip()
    if (result.startswith('"') and result.endswith('"')) or \
       (result.startswith("'") and result.endswith("'")):
        result = result[1:-1].strip()

    # Remove ```html``` block markers if present (case-insensitive)
    if result.lower().startswith("```html"):
        result = result[len("```html"):].lstrip()
    if result.endswith("```"):
        result = result[:-len("```")].rstrip()
        
    if result.lower().startswith("```json"):
        result = result[len("```json"):].lstrip()
    if result.endswith("```"):
        result = result[:-len("```")].rstrip()

    # Remove unnecessary backslashes before quotes
    result = result.replace('\\"', '"')
    result = result.replace("\\'", "'")

    # Remove ALL newline characters
    result = result.replace('\n', '')

    # Remove extra whitespace
    import re
    result = re.sub(r'\s+', ' ', result)

    # Basic indentation
    indentation_level = 0
    indent_size = 2
    reformatted_code = ""
    i = 0
    while i < len(result):
        char = result[i]

        if char == '<':
            next_tag = result[i+1:i+10].lower()
            is_closing_tag = result[i+1] == '/'
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
