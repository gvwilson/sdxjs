# Build Tools

-   `bib.js`: translate a YAML bibliiography like `bib.yml` into a Markdown file `bib.md`.

-   `catalog.js`: list all of the elements and attributes used in the generated HTML.

-   `check.js`: run integrity checks on source files and the generated HTML.
    Currently reports many false positives.

-   `chunklength.js`: reports the length in lines of all pre-formatted inclusions.

-   `clean.js`: recursively delete files and directories.

-   `exercises.js`: report the number of exercises per chapter.

-   `gloss.js`: combine a local YAML glossary like `gloss.yml`
    with the glossary file downloaded from Glosario
    and translate into a Markdown file `gloss.md`.

-   `html.js`: translate Markdown to HTML using EJS.

-   `latex.js`: translate the generated HTML to LaTeX.

-   `longlines.js`: report overly-long lines in pre-formatted file inclusions.

-   `pages.js`: report the number of pages per chapter in the generated PDF.

-   `slugs.js`: extract information about chapters and filenames from the YAML configuration.
    This is used to initialize variables in the Makefiles.

-   `terms.js`: report the glossary terms defined by each chapter.

-   `utils.js`: shared functions.

-   `wordlist.js`: list all words used outside pre-formatted code blocks (for checking spelling).

-   `wrap.js`: wrap long lines.
    This is used in the build rules for automatically generated output files;
    lines of source code must be wrapped manually.
