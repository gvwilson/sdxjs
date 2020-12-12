# Chapter slugs.
CHAPTERS := $(shell bin/slugs.js chapters . docs/${VOLUME} common.yml ${VOLUME}.yml)

# Markdown chapter files.
MARKDOWN := $(shell bin/slugs.js source . docs/${VOLUME} common.yml ${VOLUME}.yml)

# HTML output files.
HTML := $(shell bin/slugs.js html . docs/${VOLUME} common.yml ${VOLUME}.yml)

# Complete list of exercise source files.
EXERCISES := \
  $(wildcard $(patsubst %,%/*/problem.md,${CHAPTERS})) \
  $(wildcard $(patsubst %,%/*/solution.md,${CHAPTERS}))

# Complete list of JavaScript source files.
JAVASCRIPT := \
  $(wildcard $(patsubst %,%/*.js,${CHAPTERS})) \
  $(wildcard $(patsubst %,%/*/*.js,${CHAPTERS}))

# Include files for HTML.
INC := $(wildcard inc/*.html)

# Supporting LaTeX files for PDF version.
TEX := \
  $(wildcard tex/*.tex) \
  $(wildcard tex/*.cls)

# Static files.
STATIC_SRC := $(wildcard static/*.*) $(wildcard static/fonts/*/*.*)
STATIC_DST := $(patsubst %,docs/%,${STATIC_SRC})

# Files we copy directly.
DIRECT_SRC := .nojekyll CNAME favicon.ico index.html
DIRECT_DST := $(patsubst %,docs/%,${DIRECT_SRC})

.DEFAULT: commands

## commands: show available commands
commands:
	@grep -h -E '^##' ${MAKEFILE_LIST} | sed -e 's/## //g' | column -t -s ':'

## html: rebuild html
html: docs/${VOLUME}/index.html ${DIRECT_DST}

## serve: run a server on port 4000
serve: docs/${VOLUME}/index.html
	@npm run serve

## pdf: rebuild PDF
pdf: ${VOLUME}.pdf

## bib: rebuild bibliography
bib: bib.md

## gloss: rebuild glossary
gloss: gloss.md

## ----: ----

## fixme: show all FIXME markers
fixme:
	@fgrep -i fixme ${MARKDOWN}

## hygiene: run all checks
hygiene:
	-@make ejslint
	-@make standard
	-@make check

## check: check that files match style rules
check:
	@make html
	-@bin/check.js \
	--common common.yml \
	--config ${VOLUME}.yml \
	--html ${HTML} \
	--markdown ${MARKDOWN} ${EXERCISES}

## ejslint: run checks on template expansions
ejslint:
	@npm run ejslint

## standard: run checks on code formatting
standard:
	@standard ${JAVASCRIPT}

## chunklength: report lengths of included chunks
chunklength: html
	@bin/chunklength.js ${HTML}

## latex: rebuild LaTeX file (use 'make pdf' for book)
latex: ${VOLUME}.tex

## catalog: list all nodes and attributes
catalog:
	bin/catalog.js --ignore --input ${HTML}

## terms: list glossary terms per chapter
terms:
	@bin/terms.js $(filter-out CONTRIBUTING.md gloss.md,${MARKDOWN})

## exercises: count exercises per chapter
exercises:
	@bin/exercises.js ${VOLUME}.yml | column -t -s '|'

## examples: rebuild all examples in sub-directories
examples:
	@for d in ${CHAPTERS}; do echo ""; echo $$d; make -C $$d; done

## erase: erase all examples in sub-directories
erase:
	@for d in ${CHAPTERS}; do echo ""; echo $$d; make -C $$d erase; done

## wordlist: what words are used in prose?
wordlist:
	@bin/wordlist.js --input ${HTML}

## spelling: what words are incorrect?
spelling: docs/${VOLUME}/index.html
	@-bin/wordlist.js --input ${HTML} | aspell list | sort | uniq | diff - words.txt

## pages: count pages per chapter.
pages: ${VOLUME}.aux
	@bin/pages.js ${VOLUME}.aux | column -t -s '|'

## clean: clean up
clean:
	@rm -f ${VOLUME}.{aux,log,out,pdf,tex,toc}
	@find . -name '*~' -exec rm {} \;

## settings: show settings
settings:
	@echo CHAPTERS = "${CHAPTERS}"
	@echo DIRECT_DST = "${DIRECT_DST}"
	@echo DIRECT_SRC = "${DIRECT_SRC}"
	@echo EXERCISES = "${EXERCISES}"
	@echo HTML = "${HTML}"
	@echo INC = "${INC}"
	@echo JAVASCRIPT = "${JAVASCRIPT}"
	@echo MARKDOWN = "${MARKDOWN}"
	@echo STATIC_DST = "${STATIC_DST}"
	@echo STATIC_SRC = "${STATIC_SRC}"

# --------------------

bib.md: bin/bib.js bib.yml
	bin/bib.js \
	--input bib.yml \
	--output bib.md

gloss.md: gloss.yml bin/gloss.js $(filter-out gloss.md,${MARKDOWN}) ${EXERCISES}
	bin/gloss.js \
	--glosario \
	--input gloss.yml \
	--output gloss.md \
	--sources ${MARKDOWN} ${EXERCISES}

docs/${VOLUME}/index.html: bin/html.js ${VOLUME}.yml common.yml links.yml ${MARKDOWN} ${INC} ${STATIC_DST}
	bin/html.js \
	--root . \
	--html docs/${VOLUME} \
	--common common.yml \
	--config ${VOLUME}.yml \
	--gloss gloss.md \
	--links links.yml \
	--replaceDir

${VOLUME}.tex: bin/latex.js docs/${VOLUME}/index.html ${TEX}
	bin/latex.js \
	--common common.yml \
	--config ${VOLUME}.yml \
	--html docs/${VOLUME} \
	--root . \
	--output ${VOLUME}.tex \
	--head tex/head.tex \
	--foot tex/foot.tex \
	--numbering docs/${VOLUME}/numbering.js

${VOLUME}.pdf ${VOLUME}.aux: ${VOLUME}.tex
	@pdflatex ${VOLUME} && pdflatex ${VOLUME}

docs/${VOLUME}/index.html: ${VOLUME}/index.md
docs/${VOLUME}/conduct/index.html: CONDUCT.md
docs/${VOLUME}/contributing/index.html: CONTRIBUTING.md
docs/${VOLUME}/license/index.html: LICENSE.md
docs/${VOLUME}/authors/index.html: authors.md
docs/${VOLUME}/gloss/index.html: gloss.md
docs/${VOLUME}/links/index.html: links.md
docs/${VOLUME}/%/index.html: %/index.md

%/index.md: %/*/problem.md %/*/solution.md
	@touch $@

bin/html.js: bin/utils.js
	@touch $@

bin/wrap.js: bin/utils.js
	@touch $@

docs/static/%: static/%
	@mkdir -p $(dir $@)
	@cp $< $@

docs/index.html: index.html
	@mkdir -p $(dir $@)
	@cp $< $@

docs/.nojekyll : .nojekyll
	@mkdir -p $(dir $@)
	@cp $< $@

docs/CNAME: CNAME
	@mkdir -p $(dir $@)
	@cp $< $@

docs/favicon.ico: favicon.ico
	@mkdir -p $(dir $@)
	@cp $< $@
