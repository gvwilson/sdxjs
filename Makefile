SITE=./docs
LANGUAGE=en
PORT=4000

.DEFAULT: commands

## commands: show available commands
commands:
	@grep -h -E '^##' ${MAKEFILE_LIST} | sed -e 's/## //g' | column -t -s ':'

## build: rebuild site without running server
.PHONY: build
build:
	ivy build
	echo '*.pdf' > docs/.gitignore
	python bin/single-html.py docs/index.html > ./docs/all.html

## serve: build site and run server
.PHONY: serve
serve:
	ivy watch

## single-page: create single-page HTML
.PHONY: single-page
single-page:
	python bin/single-html.py docs/index.html > ./docs/all.html


## latex: create LaTeX document.
.PHONY: latex
latex:
	python bin/tex.py --head data/head.tex --foot data/foot.tex < ./docs/all.html > docs/all.tex
	cp data/bibliography.bib docs/bibliography.bib

## pdf: create PDF document.
.PHONY: pdf
pdf:
	cd docs && pdflatex all
	cd docs && biber all
	cd docs && pdflatex all
	cd docs && pdflatex all

## ----

## clean: clean up stray files
clean:
	@find . -name '*~' -exec rm {} \;

## validate: run html5validator on generated files
validate: ${HOME_PAGE}
	@html5validator --root ${SITE} \
	--ignore \
	'Attribute "g" not allowed on element "span"' \
	'Attribute "i" not allowed on element "span"'

# Local commands if available.
-include local.mk
