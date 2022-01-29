SITE=./docs
LANGUAGE=en
PORT=4000

CONFIG=mccole.yml
LAYOUTS=$(wildcard _layouts/*.html)
MARKDOWN=$(wildcard *.md) $(wildcard */index.md)
HTML=${SITE}/index.html $(wildcard ${SITE}/*/index.html)
STATIC=$(wildcard static/*.*)

BIB=_data/bibliography.bib
GLOSSARY=_data/glossary.yml
HOME_PAGE=${SITE}/index.html

.DEFAULT: commands

## commands: show available commands
commands:
	@grep -h -E '^##' ${MAKEFILE_LIST} | sed -e 's/## //g' | column -t -s ':'

## build: rebuild site without running server
build:
	mccole

## serve: build site and run server
serve:
	mccole -r ${PORT}

## make-spelling: create list of unknown words
make-spelling: ${HOME_PAGE}
	@cat ${HTML} | bin/prep-spelling.py | aspell -H list | sort | uniq

## ----

## check-spelling: check for misspelled words
check-spelling: ${HOME_PAGE}
	@cat ${HTML} | bin/prep-spelling.py | aspell -H list | sort | uniq | bin/check-spelling.py --compare _data/spelling.txt

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

## clean: clean up stray files
clean:
	@find . -name '*~' -exec rm {} \;

## validate: run html5validator on generated files
validate: ${HOME_PAGE}
	@html5validator --root ${SITE}

$(filter-out bin/utils.py,$(wildcard bin/*.py)): bin/utils.py
	touch $@

# Local commands if available.
-include local.mk
