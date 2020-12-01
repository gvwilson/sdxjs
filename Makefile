# Infer chapter slugs from presence of 'index.md' files.
SLUGS=$(patsubst %/index.md,%,$(wildcard */index.md))

# Complete list of Markdown chapter files.
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

# Complete list of exercise source files.
EXERCISES=\
  $(wildcard $(patsubst %,%/*/problem.md,${SLUGS})) \
  $(wildcard $(patsubst %,%/*/solution.md,${SLUGS}))

# Complete list of JavaScript source files.
JAVASCRIPT=\
  $(wildcard $(patsubst %,%/*.js,${SLUGS})) \
  $(wildcard $(patsubst %,%/*/*.js,${SLUGS}))

# Include files for HTML.
INC=$(wildcard _inc/*.html)

# Supporting LaTeX files for PDF version.
TEX=\
  $(wildcard _tex/*.tex) \
  $(wildcard _tex/*.cls)

# Static files.
STATIC=$(wildcard static/site.*) $(wildcard static/fonts/*/*.*)

# Directories containing sub-Makefiles for reproducing examples.
SUBMAKEDIR=$(patsubst %/Makefile,%,$(wildcard */Makefile))

# All source files.
ALL_FILES=\
  ${MARKDOWN} \
  ${INC} \
  ${STATIC} \
  $(wildcard $(patsubst %,%/*.*,${SLUGS})) \
  $(wildcard $(patsubst %,%/*/*.*,${SLUGS}))

.DEFAULT: commands

## commands: show available commands
commands:
	@grep -h -E '^##' ${MAKEFILE_LIST} | sed -e 's/## //g' | column -t -s ':'

## html: rebuild html
html: docs/index.html

## serve: run a server on port 4000
serve: docs/index.html
	@npm run serve

## pdf: rebuild PDF
pdf: book.pdf

## bib: rebuild bibliography
bib: bib.md

## gloss: rebuild glossary
gloss: gloss.md

## ----: ----

## fixme: show all FIXME markers
fixme:
	@fgrep -i fixme ${ALL_FILES}

## hygiene: run all checks
hygiene:
	-@make ejslint
	-@make standard
	-@make check

## check: check that files match style rules
check:
	@make html
	-@_tools/check.js \
	--config _config.yml \
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
	@_tools/chunklength.js ${HTML}

## latex: rebuild LaTeX file (use 'make pdf' for book)
latex: book.tex

## catalog: list all nodes and attributes
catalog:
	_tools/catalog.js --ignore --input ${HTML}

## terms: list glossary terms per chapter
terms:
	@_tools/terms.js $(filter-out CONTRIBUTING.md gloss.md,${MARKDOWN})

## exercises: count exercises per chapter
exercises:
	@_tools/exercises.js _config.yml | column -t -s ':'

## examples: rebuild all examples in sub-directories
examples:
	@for d in ${SUBMAKEDIR}; do echo ""; echo $$d; make -C $$d; done

## erase: erase all examples in sub-directories
erase:
	@for d in ${SUBMAKEDIR}; do echo ""; echo $$d; make -C $$d erase; done

## wordlist: what words are used in prose?
wordlist:
	@_tools/wordlist.js --input ${HTML}

## spelling: what words are incorrect?
spelling:
	@-_tools/wordlist.js --input ${HTML} | aspell list | sort | uniq | diff - _words.txt

## pages: count pages per chapter.
pages: book.aux
	@_tools/pages.js book.aux | column -t -s ':'

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
	@echo STATIC = "${STATIC}"
	@echo EXERCISES = "${EXERCISES}"

# --------------------

bib.md: _tools/bib.js _bib.yml
	_tools/bib.js \
	--input _bib.yml \
	--output bib.md

gloss.md: _gloss.yml _tools/gloss.js $(filter-out gloss.md,${MARKDOWN}) ${EXERCISES}
	_tools/gloss.js \
	--glosario \
	--input _gloss.yml \
	--output gloss.md \
	--sources ${MARKDOWN} ${EXERCISES}

docs/index.html: _tools/html.js _config.yml _links.yml ${ALL_FILES}
	_tools/html.js \
	--rootDir . \
	--outputDir docs \
	--configFile _config.yml \
	--linksFile _links.yml \
	--replaceDir

book.tex: _tools/latex.js docs/index.html ${TEX}
	_tools/latex.js \
	--config _config.yml \
	--htmlDir docs \
	--outputFile book.tex \
	--head _tex/head.tex \
	--foot _tex/foot.tex \
	--numbering docs/numbering.js

book.pdf book.aux: book.tex
	@pdflatex book && pdflatex book

docs/index.html: index.md
docs/conduct/index.html: CONDUCT.md
docs/contributing/index.html: CONTRIBUTING.md
docs/license/index.html: LICENSE.md
docs/authors/index.html: authors.md
docs/gloss/index.html: gloss.md
docs/links/index.html: links.md
docs/%/index.html: %/index.md

_tools/html.js: _tools/dirname.js
	@touch $@

_tools/wrap.js: _tools/dirname.js
	@touch $@
