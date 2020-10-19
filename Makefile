# Infer chapter slugs from presence of 'index.md' files.
SLUGS=$(patsubst %/index.md,%,$(wildcard */index.md))

# Complete list of Markdown source files.
MARKDOWN=\
  index.md \
  CONDUCT.md \
  CONTRIBUTING.md \
  LICENSE.md \
  authors.md \
  bib.md \
  gloss.md \
  links.md \
  $(patsubst %,%/index.md,${SLUGS})

# Corresponding list of HTML files.
HTML=\
  docs/index.html \
  docs/conduct/index.html \
  docs/contributing/index.html \
  docs/license/index.html \
  docs/authors/index.html \
  docs/bib/index.html \
  docs/gloss/index.html \
  docs/links/index.html \
  $(patsubst %,docs/%/index.html,${SLUGS})

# Complete list of JavaScript source files.
JAVASCRIPT=\
  $(wildcard $(patsubst %,%/*.js,${SLUGS})) \
  $(wildcard $(patsubst %,%/*/*.js,${SLUGS}))

# Supporting LaTeX files for PDF version.
TEX=\
  $(wildcard tex/*.tex) \
  $(wildcard tex/*.cls)

# Directories containing sub-Makefiles for reproducing examples.
SUBMAKEDIR=$(patsubst %/Makefile,%,$(wildcard */Makefile))

.DEFAULT: commands

## commands: show available commands
commands :
	@grep -h -E '^##' ${MAKEFILE_LIST} | sed -e 's/## //g' | column -t -s ':'

## serve: run a server on port 4000
serve: docs/index.html
	@npm run serve

## hygiene: run all checks
hygiene:
	-@make ejslint
	-@make standard
	-@make check

## check: check that files match style rules
check: docs/index.html
	-@bin/check.js \
	--config config.yml \
	--html ${HTML} \
	--markdown ${MARKDOWN}

## ejslint: run checks on template expansions
ejslint:
	@npm run ejslint

## standard: run checks on code formatting
standard:
	@standard ${JAVASCRIPT}

## ----: ----

## bib: rebuild bibliography
bib: bib.md

bib.md: bin/bib.js bib.yml
	bin/bib.js \
	--input bib.yml \
	--output bib.md

## examples: rebuild all examples in sub-directories
examples:
	@for d in ${SUBMAKEDIR}; do echo ""; echo $$d; make -C $$d; done

## erase: erase all examples in sub-directories
erase:
	@for d in ${SUBMAKEDIR}; do echo ""; echo $$d; make -C $$d erase; done

## gloss: rebuild glossary
gloss: gloss.md

gloss.md: gloss.yml bin/gloss.js $(filter-out gloss.md,${MARKDOWN})
	bin/gloss.js \
	--glosario \
	--input gloss.yml \
	--output gloss.md \
	--sources index.md $(patsubst %,%/index.md,${SLUGS})

## html: rebuild html
html: docs/index.html docs/numbering.js docs/static/site.css docs/static/site.js

docs/index.html docs/numbering.js docs/static/site.css docs/static/site.js: bin/html.js config.yml links.yml ${MARKDOWN} static/site.css static/site.js
	bin/html.js \
	--rootDir . \
	--outputDir docs \
	--configFile config.yml \
	--linksFile links.yml \
	--replaceDir

## latex: rebuild LaTeX file (use 'make pdf' for book)
latex: book.tex

book.tex: bin/latex.js docs/index.html ${TEX}
	bin/latex.js \
	--config config.yml \
	--htmlDir docs \
	--outputFile book.tex \
	--head tex/head.tex \
	--foot tex/foot.tex \
	--numbering docs/numbering.js

## pdf: rebuild PDF
pdf: book.pdf

book.pdf: book.tex
	@pdflatex book && pdflatex book

## ----: ----

## clean: clean up
clean:
	@rm -f book.*
	@find . -name '*~' -exec rm {} \;

## settings: show settings
settings:
	@echo SLUGS = "${SLUGS}"
	@echo MARKDOWN = "${MARKDOWN}"
	@echo HTML = "${HTML}"
	@echo JAVASCRIPT = "${JAVASCRIPT}"

docs/index.html: index.md
docs/conduct/index.html: CONDUCT.md
docs/contributing/index.html: CONTRIBUTING.md
docs/license/index.html: LICENSE.md
docs/authors/index.html: authors.md
docs/gloss/index.html: gloss.md
docs/links/index.html: links.md
docs/%/index.html: %/index.md
