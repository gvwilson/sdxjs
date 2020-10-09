SLUGS=$(patsubst %/index.md,%,$(wildcard */index.md))

MARKDOWN=\
  index.md \
  CONDUCT.md \
  CONTRIBUTING.md \
  LICENSE.md \
  authors.md \
  gloss.md \
  links.md \
  $(patsubst %,%/index.md,${SLUGS})

HTML=\
  docs/index.html \
  docs/conduct/index.html \
  docs/contributing/index.html \
  docs/license/index.html \
  docs/authors/index.html \
  docs/gloss/index.html \
  docs/links/index.html \
  $(patsubst %,docs/%/index.html,${SLUGS})

TEX=$(wildcard tex/*.tex) $(wildcard tex/*.cls)

.DEFAULT: commands

## commands: show available commands
commands :
	@grep -h -E '^##' ${MAKEFILE_LIST} | sed -e 's/## //g' | column -t -s ':'

## ----: ----

## serve: run a server on port 4000
serve: docs/index.html
	@npm run serve

## check: check that everything is tidy
check: docs/index.html
	@bin/check.js \
	--html ${HTML} \
	--markdown ${MARKDOWN}

## bib: rebuild bibliography
bib: bib.md

bib.md: bin/bib.js bib.yml
	bin/bib.js \
	--input bib.yml \
	--output bib.md

## gloss: rebuild glossary
gloss: gloss.md

gloss.md: gloss.yml bin/gloss.js $(filter-out gloss.md,${MARKDOWN})
	bin/gloss.js \
	--glosario \
	--input gloss.yml \
	--output gloss.md \
	--sources index.md $(patsubst %,%/index.md,${SLUGS})

## html: rebuild html
html: docs/index.html docs/numbering.js

docs/index.html docs/numbering.js: bin/html.js config.yml links.yml ${MARKDOWN}
	bin/html.js \
	--rootDir . \
	--outputDir docs \
	--configFile config.yml \
	--linksFile links.yml

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

docs/index.html: index.md
docs/conduct/index.html: CONDUCT.md
docs/contributing/index.html: CONTRIBUTING.md
docs/license/index.html: LICENSE.md
docs/authors/index.html: authors.md
docs/gloss/index.html: gloss.md
docs/links/index.html: links.md
docs/%/index.html: %/index.md
