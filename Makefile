JEKYLL=bundle exec jekyll
SITE=./_site
LANGUAGE=en

CONFIG=_config.yml
INCLUDES=$(wildcard _includes/*)
LAYOUTS=$(wildcard _layouts/*.html)
MARKDOWN=$(wildcard *.md) $(wildcard */index.md)
HTML=${SITE}/index.html $(wildcard ${SITE}/*/index.html)
EXERCISES=$(wildcard */x-*/problem.md) $(wildcard */x-*/solution.md)
STATIC=$(wildcard static/*.*)
TEX=$(wildcard tex/*.*)

BIB_YML=_data/bibliography.yml
BIB_MD=bibliography/index.md
GLOSSARY_IN=_data/glossary.yml
HOME_PAGE=${SITE}/index.html
INDEX_YML=_data/index.yml
NUM_YML=_data/numbering.yml
TERMS_YML=_data/terms.yml
ALL_OUT=${BIB_MD} ${INDEX_YML} ${NUM_YML} ${TERMS_YML}
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
  bin\
  favicon.ico\
  glossary\
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
  *~\
  */*~

.DEFAULT: commands

## commands: show available commands
commands:
	@grep -h -E '^##' ${MAKEFILE_LIST} | sed -e 's/## //g' | column -t -s ':'

## build: rebuild site without running server
build: ${ALL_OUT} LICENSE.md
	${JEKYLL} build

## serve: build site and run server
serve: ${ALL_OUT} LICENSE.md
	${JEKYLL} serve

## book.tex: create LaTeX file
book.tex: ${HOME_PAGE} bin/html2tex.py ${NUM_YML} ${TEX}
	bin/html2tex.py --config ${CONFIG} --numbering ${NUM_YML} --site _site --head tex/head.tex --foot tex/foot.tex > book.tex

## book.pdf: create PDF file
book.pdf: book.tex ${TEX}
	@pdflatex book
	makeindex book
	@pdflatex book

## make-bib: create Markdown version of bibliography
make-bib: ${BIB_MD}

## make-index: create YAML version of index
make-index: ${INDEX_YML}

## make-numbering: create YAML cross-referencing
make-numbering: ${NUM_YML}

## make-spelling: create list of unknown words
make-spelling: ${HOME_PAGE}
	@cat ${HTML} | bin/prep-spelling.py | aspell -H list | sort | uniq

## make-terms: create YAML file listing terms per chapter
make-terms: ${TERMS_YML}

## ----

## check: run all checks
check:
	@make check-bib
	@make check-gloss
	@make check-chunk-length
	@make check-code-blocks
	@make check-dom
	@make check-links
	@make check-numbering
	@make check-spelling

## check-bib: compare citations and definitions
check-bib:
	@bin/check-bib.py --bibliography ${BIB_YML} --sources ${MARKDOWN} ${GLOSSARY_IN} _includes/intro.md

## check-chunk-length: see whether any inclusions are overly long
check-chunk-length: ${HOME_PAGE}
	@bin/check-chunk-length.py --sources ${HTML}

## check-code-blocks: check inline code blocks
check-code-blocks:
	@bin/check-code-blocks.py --config ${CONFIG}

## check-dom: check classes and attributes in generated HTML.
check-dom: ${HOME_PAGE}
	@bin/check-dom.py --sources ${HTML}

## check-gloss: compare references and definitions
check-gloss:
	@bin/check-gloss.py --glossary ${GLOSSARY_IN} --language ${LANGUAGE} --sources ${MARKDOWN} ${EXERCISES}

## check-links: make sure all external links resolve
check-links:
	@bin/check-links.py --config ${CONFIG} --sources ${MARKDOWN} ${EXTRA_MARKDOWN} ${EXERCISES} ${GLOSSARY_IN}

## check-numbering: make sure all internal cross-references resolve
check-numbering: ${NUM_YML}
	@bin/check-numbering.py --numbering ${NUM_YML} --sources ${MARKDOWN} ${EXERCISES}

## check-spelling: check for misspelled words
check-spelling: ${HOME_PAGE}
	@cat ${HTML} | bin/prep-spelling.py | aspell -H list | sort | uniq | bin/check-spelling.py --compare _data/spelling.txt

## ----

## show-chapters: how many words are in each chapter?
show-chapters:
	@bin/show-chapters.py --config ${CONFIG} | column -t -s '|'

## show-dom: what classes and other attributes are used?
show-dom: ${HOME_PAGE}
	@bin/show-dom.py --sources ${HTML}

## show-fixme: what still needs to be done?
show-fixme:
	@bin/show-fixme.py --sources ${MARKDOWN} ${GLOSSARY_IN} | column -t -s '|'
	@fgrep fixme ${MARKDOWN} | wc -l

## show-index: what terms are indexed where?
show-index: ${HOME_PAGE}
	@bin/show-index.py --config ${CONFIG}

## show-pages: how many pages are in the PDF version?
show-pages: book.pdf
	@bin/show-pages.py --input book.aux | column -t -s '|'

## show-sections: how many words are in each section?
show-sections:
	@bin/show-sections.py --config ${CONFIG} | column -t -s '|'

## ----

## release: make a zip file with infrastructure for use elsehwere
release:
	@zip -r ../template.zip ${RELEASE_FILES} --exclude ${RELEASE_EXCLUDES}

## clean: clean up stray files
clean:
	@find . -name '*~' -exec rm {} \;
	@rm -f *.aux *.idx *.ilg *.ind *.log *.out *.tex *.toc

## sterile: clean up and erase generated site
sterile:
	@make clean
	@rm -rf ${SITE}

# Files

${BIB_MD}: ${BIB_YML} bin/make-bib.py
	bin/make-bib.py --input ${BIB_YML} --output ${BIB_MD}

${INDEX_YML}: bin/make-index.py ${CONFIG} ${MARKDOWN}
	bin/make-index.py --config ${CONFIG} --output ${INDEX_YML}

${NUM_YML}: bin/make-numbering.py ${CONFIG} ${MARKDOWN}
	 bin/make-numbering.py --config ${CONFIG} --output ${NUM_YML}

${TERMS_YML}: bin/make-terms.py ${CONFIG} ${MARKDOWN} ${GLOSSARY_IN}
	bin/make-terms.py --config ${CONFIG} --glossary ${GLOSSARY_IN} --language ${LANGUAGE} --output ${TERMS_YML}

${HOME_PAGE}: ${CONFIG} ${MARKDOWN} ${INCLUDES} ${LAYOUTS} ${STATIC} ${ALL_OUT} LICENSE.md
	${JEKYLL} build

$(filter-out bin/utils.py,$(wildcard bin/*.py)): bin/utils.py
	touch $@

LICENSE.md: _config.yml bin/make-license.py
	@bin/make-license.py --config ${CONFIG} --output $@

# Local commands if available.
-include local.mk
