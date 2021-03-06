JEKYLL=bundle exec jekyll
BIB=_includes/bib.html
SITE=./_site
LANGUAGE=en

CONFIG=_config.yml
INCLUDES=$(wildcard _includes/*)
LAYOUTS=$(wildcard _layouts/*.html)
MARKDOWN=$(wildcard *.md) $(wildcard */index.md)
HTML=${SITE}/index.html $(wildcard ${SITE}/*/index.html)
EXERCISES=$(wildcard */x-*/problem.md) $(wildcard */x-*/solution.md)
STATIC=$(wildcard _sass/*/*.scss) $(wildcard css/*.css) $(wildcard css/*.scss) $(wildcard js/*.js)
TEX=$(wildcard tex/*.*)

BIB_IN=_data/bibliography.yml
BIB_OUT=bibliography/index.md
GLOSSARY_IN=_data/glossary.yml
HOME_PAGE=${SITE}/index.html
UNSPELLED=${BIB_OUT} glossary/index.md links/index.md index.md
NUM_OUT=_data/numbering.yml
TERMS_OUT=_data/terms.yml
ALL_OUT=${BIB_OUT} ${NUM_OUT} ${TERMS_OUT}
EXTRA_MARKDOWN=_includes/intro.md

RELEASE_FILES=\
  CONDUCT.md\
  CONTRIBUTING.md\
  LICENSE.md\
  Makefile\
  Gemfile\
  Gemfile.lock\
  _includes\
  _layouts\
  _sass\
  bin\
  css\
  favicon.ico\
  links\
  static/local.*\
  static/*.pdf\
  static/*.svg\
  tex

RELEASE_EXCLUDES=\
  _includes/intro.md\
  bin/__pycache__\
  bin/__pycache__/*\
  misc\
  misc/*.*\
  *~

.DEFAULT: commands

## commands: show available commands
commands:
	@grep -h -E '^##' ${MAKEFILE_LIST} | sed -e 's/## //g' | column -t -s ':'

## build: rebuild site without running server
build: ${ALL_OUT}
	${JEKYLL} build

## serve: build site and run server
serve: ${ALL_OUT}
	${JEKYLL} serve

## book.tex: create LaTeX file
book.tex: ${HOME_PAGE} bin/html2tex.py ${NUM_OUT} ${TEX}
	bin/html2tex.py --config ${CONFIG} --numbering ${NUM_OUT} --site _site --head tex/head.tex --foot tex/foot.tex > book.tex

## book.pdf: create PDF file
book.pdf: book.tex ${TEX}
	@pdflatex book
	@pdflatex book

## make-bib: create Markdown version of bibliography
make-bib: ${BIB_OUT}

## make-numbering: create YAML cross-referencing
make-numbering: ${NUM_OUT}

## make-spelling: create list of unknown words
make-spelling:
	@bin/make-spelling.py --sources $(filter-out ${UNSPELLED},${MARKDOWN})

## make-terms: create YAML file listing terms per chapter
make-terms: ${TERMS_OUT}

${BIB_OUT}: ${BIB_IN} bin/make-bib.py
	bin/make-bib.py --input ${BIB_IN} --output ${BIB_OUT}

${NUM_OUT}: bin/make-numbering.py ${CONFIG} ${MARKDOWN}
	 bin/make-numbering.py --config ${CONFIG} --output ${NUM_OUT}

${TERMS_OUT}: bin/make-terms.py ${CONFIG} ${MARKDOWN} ${GLOSSARY_IN}
	bin/make-terms.py --config ${CONFIG} --glossary ${GLOSSARY_IN} --language ${LANGUAGE} --output ${TERMS_OUT}

${HOME_PAGE}: ${CONFIG} ${MARKDOWN} ${INCLUDES} ${LAYOUTS} ${STATIC} ${ALL_OUT}
	${JEKYLL} build

$(filter-out bin/utils.py,$(wildcard bin/*.py)): bin/utils.py
	touch $@

## ----

## check: run all checks
check:
	@make check-bib
	@make check-chunk-length
	@make check-gloss
	@make check-links
	@make check-numbering
	@make check-ref
	@make check-spelling

## check-bib: compare citations and definitions
check-bib:
	@bin/check-bib.py --bibliography ${BIB_IN} --sources ${MARKDOWN} _includes/intro.md

## check-chunk-length: see whether any inclusions are overly long
check-chunk-length:
	@bin/check-chunk-length.py --sources ${HTML}

## check-gloss: compare references and definitions
check-gloss:
	@bin/check-gloss.py --glossary ${GLOSSARY_IN} --language ${LANGUAGE} --sources ${MARKDOWN} ${EXERCISES}

## check-links: make sure all external links resolve
check-links:
	@bin/check-links.py --config ${CONFIG} --sources ${MARKDOWN} ${EXTRA_MARKDOWN} ${EXERCISES}

## check-numbering: make sure all internal cross-references resolve
check-numbering: ${NUM_OUT}
	@bin/check-numbering.py --numbering ${NUM_OUT} --sources ${MARKDOWN} ${EXERCISES}

## check-ref: compare chapter cross-references to chapters and appendices
check-ref:
	@bin/check-ref.py --config ${CONFIG} --sources ${MARKDOWN} ${EXERCISES}

## check-spelling: check for misspelled words
check-spelling:
	@bin/check-spelling.py --compare _data/spelling.yml --sources $(filter-out ${UNSPELLED},${MARKDOWN} ${EXERCISES})

## ----

## count-pages: how many pages are in the PDF version?
count-pages: book.pdf
	@bin/count-pages.py --input book.aux | column -t -s '|'

## release: make a zip file with infrastructure for use elsehwere
release:
	@zip -r ../template.zip ${RELEASE_FILES} --exclude ${RELEASE_EXCLUDES}

## clean: clean up stray files
clean:
	@find . -name '*~' -exec rm {} \;
	@rm -f *.aux *.log *.out *.tex *.toc

## sterile: clean up and erase generated site
sterile:
	@make clean
	@rm -rf ${SITE}

# Local commands if available.
-include local.mk
