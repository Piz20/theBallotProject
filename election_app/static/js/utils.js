// utils.js

function reformatHTML(htmlCode) {
    /**
     * Reformats HTML code to improve readability by adding basic indentation
     * and removes unnecessary backslashes and ALL newline characters.
     * Removes ```html``` block markers and outer quotes.
     *
     * Args:
     * htmlCode: A string containing HTML code, optionally enclosed in ```html```
     * and/or outer quotes.
     *
     * Returns:
     * A string containing the reformatted HTML code without any newline characters.
     */
  
    // Remove outer quotes if present
    htmlCode = htmlCode.trim();
    if ((htmlCode.startsWith('"') && htmlCode.endsWith('"')) ||
        (htmlCode.startsWith("'") && htmlCode.endsWith("'"))) {
      htmlCode = htmlCode.slice(1, -1).trim();
    }
  
    // Remove ```html``` block markers if present (case-insensitive)
    if (htmlCode.toLowerCase().startsWith("```html")) {
      htmlCode = htmlCode.slice("```html".length).trimStart();
    }
    if (htmlCode.endsWith("```")) {
      htmlCode = htmlCode.slice(0, -("```".length)).trimEnd();
    }
  
    // Remove unnecessary backslashes (specifically before quotes in attributes)
    htmlCode = htmlCode.replace(/\\"/g, '"');
    htmlCode = htmlCode.replace(/\\'/g, "'");
  
    // Remove ALL newline characters
    htmlCode = htmlCode.replace(/\n/g, '');
  
    // Remove extra spaces that might have been introduced
    htmlCode = htmlCode.replace(/\s+/g, ' ');
  
    // Basic indentation (this will be less sophisticated than js-beautify)
    let indentationLevel = 0;
    const indentSize = 2;
    let reformattedCode = '';
  
    for (let i = 0; i < htmlCode.length; i++) {
      const char = htmlCode[i];
  
      if (char === '<') {
        if (htmlCode.substring(i + 1).startsWith('/')) {
          indentationLevel = Math.max(0, indentationLevel - 1);
          reformattedCode += ' '.repeat(indentationLevel * indentSize) + char;
        } else if (!htmlCode.substring(i + 1).startsWith('br') && !htmlCode.substring(i + 1).startsWith('hr') && !htmlCode.substring(i + 1).startsWith('img') && !htmlCode.substring(i + 1).startsWith('input') && !htmlCode.substring(i + 1).startsWith('meta') && !htmlCode.substring(i + 1).startsWith('!DOCTYPE')) {
          reformattedCode += ' '.repeat(indentationLevel * indentSize) + char;
          indentationLevel++;
        } else {
          reformattedCode += char;
        }
      } else if (char === '>') {
        reformattedCode += char;
      } else {
        reformattedCode += char;
      }
    }
  
    return reformattedCode.trim();
  }

