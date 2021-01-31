# Common configuration file.
COMMON_CONFIG = common.yml

# Output directory.
DOCS = docs

# Default volume (override with 'make V=2 target' at the command line).
ifndef V
V := 1
endif

# Full name of volume (volN).
VOLUME := vol${V}

# Home page for this volume.
HOME_PAGE := ${DOCS}/${VOLUME}/index.html

# Arguments for extracting information from YAML configuration.
SLUG_ARGS := . ${DOCS}/${VOLUME} ${COMMON_CONFIG} ${VOLUME}.yml

# Chapter slugs.
CHAPTERS := $(shell bin/slugs.js chapters ${SLUG_ARGS})

# Markdown chapter files.
MARKDOWN := $(shell bin/slugs.js source ${SLUG_ARGS})

# All HTML output files.
HTML := $(shell bin/slugs.js html ${SLUG_ARGS})

# Complete list of exercise source files.
EXERCISES := $(shell bin/slugs.js exercises ${SLUG_ARGS})

# Author files.
AUTHORS := $(patsubst %,authors/%.md,$(shell bin/slugs.js authors ${SLUG_ARGS}))

# Glossary for this volume.
GLOSS_MD := ${VOLUME}-gloss.md
GLOSS_HTML := ${DOCS}/${VOLUME}/gloss/index.html

# Links for this volume.
LINKS_YML := ${VOLUME}-links.yml

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
STATIC_SRC := .nojekyll CNAME favicon.ico index.html \
  $(wildcard static/*.*) \
  $(wildcard static/fonts/*/*.*)
STATIC_DST := $(patsubst %,${DOCS}/%,${STATIC_SRC})

# Figures.
FIGURES := $(wildcard */figures/*.svg)

# Tools.
TOOLS := $(filter-out bin/utils.js, $(wildcard bin/*.js))

# Configuration parameters.
COMMON_PARAMS := --common ${COMMON_CONFIG} --config ${VOLUME}.yml --root . --html ${DOCS}/${VOLUME}

# Temporary file for showing all figures.
ALL_FIGURES := ./all-figures.html

# Blog.
BLOG_SRC = ./_posts
BLOG_DIR = blog
BLOG_POSTS = $(wildcard ${BLOG_SRC}/*.md)

# ----------------------------------------------------------------------

.DEFAULT: commands

## commands: show available commands
commands:
	@grep -h -E '^##' ${MAKEFILE_LIST} | sed -e 's/## //g' | column -t -s ':'

## html: rebuild html
html: ${HOME_PAGE}

## serve: run a server on port 4000
serve: ${HOME_PAGE}
	@npm run serve

## pdf: rebuild PDF
pdf: ${VOLUME}.pdf

## bib: rebuild bibliography
bib: bib.md

## gloss: rebuild glossary
gloss: ${GLOSS_MD}

## links: rebuild links
links: ${LINKS_YML}

## blog: rebuild blog
blog: ${DOCS}/atom.xml

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
check: ${HOME_PAGE}
	-bin/check.js ${COMMON_PARAMS}

## ejslint: run checks on template expansions
ejslint:
	@npm run ejslint

## standard: run checks on code formatting
standard:
	@standard ${JAVASCRIPT}

## chunklength: report lengths of included chunks
chunklength: html
	@bin/chunklength.js ${HTML}

## duplinks: report duplicated hyperlinks within chapters
duplinks:
	@bin/duplinks.js ${MARKDOWN}

## latex: rebuild LaTeX file (use 'make pdf' for book)
latex: ${VOLUME}.tex

## catalog: list all nodes and attributes
catalog:
	bin/catalog.js --ignore --input ${HTML}

## terms: list glossary terms per chapter
terms:
	@bin/terms.js $(filter-out CONTRIBUTING.md ${GLOSS_MD},${MARKDOWN})

## exercises: count exercises per chapter
exercises:
	@bin/exercises.js ${VOLUME}.yml | column -t -s '|'

## numfigures: count figures per chapter
numfigures:
	@bin/numfigures.js ${COMMON_PARAMS} --figures ${ALL_FIGURES} | column -t -s '|'

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
spelling: ${HOME_PAGE}
	@-bin/wordlist.js --input ${HTML} | aspell list | sort | uniq | diff - tex/words.txt

## pages: count pages per chapter.
pages: ${VOLUME}.aux
	@bin/pages.js ${VOLUME}.aux | column -t -s '|'

## progress: report progress on prosifying chapters.
progress:
	@bin/progress.js admin/vol1-wordcount.csv | column -t -s ':'

## clean: clean up
clean:
	@rm -f ${VOLUME}.{aux,log,out,pdf,tex,toc}
	@rm -f *-links.yml
	@find . -name '*~' -exec rm {} \;

## settings: show settings
settings:
	@echo AUTHORS = "${AUTHORS}"
	@echo BLOG_SRC = "${BLOG_SRC}"
	@echo BLOG_DIR = "${BLOG_DIR}"
	@echo BLOG_POSTS = "${BLOG_POSTS}"
	@echo CHAPTERS = "${CHAPTERS}"
	@echo EXERCISES = "${EXERCISES}"
	@echo FIGURES = "${FIGURES}"
	@echo HTML = "${HTML}"
	@echo INC = "${INC}"
	@echo JAVASCRIPT = "${JAVASCRIPT}"
	@echo MARKDOWN = "${MARKDOWN}"
	@echo STATIC_DST = "${STATIC_DST}"
	@echo STATIC_SRC = "${STATIC_SRC}"
	@echo VOLUME = "${VOLUME}"

# ----------------------------------------------------------------------

bib.md: bin/bib.js bib.yml
	bin/bib.js \
	--input bib.yml \
	--output bib.md

${GLOSS_MD}: gloss.yml bin/gloss.js $(filter-out ${GLOSS_MD} links.md,${MARKDOWN}) ${EXERCISES}
	bin/gloss.js \
	--glosario \
	--input gloss.yml \
	--output ${GLOSS_MD} \
	${COMMON_PARAMS}

${LINKS_YML}: links.yml bin/links.js $(filter-out ${GLOSS_MD} links.md,${MARKDOWN}) ${EXERCISES}
	bin/links.js \
	--input links.yml \
	--output ${LINKS_YML} \
	--also ${AUTHORS} \
	${COMMON_PARAMS}

${HOME_PAGE}: bin/html.js ${VOLUME}.yml ${COMMON_CONFIG} ${LINKS_YML} ${MARKDOWN} ${INC} ${FIGURES} ${STATIC_DST} ${DOCS}/atom.xml
	bin/html.js \
	${COMMON_PARAMS} \
	--gloss ${GLOSS_MD} \
	--links ${LINKS_YML} \
	--replaceDir

${VOLUME}.tex: bin/latex.js ${HOME_PAGE} ${TEX}
	bin/latex.js \
	${COMMON_PARAMS} \
	--output ${VOLUME}.tex \
	--head tex/head.tex \
	--foot tex/foot.tex \
	--numbering ${DOCS}/${VOLUME}/numbering.js

${VOLUME}.pdf ${VOLUME}.aux: ${VOLUME}.tex
	@pdflatex ${VOLUME} && pdflatex ${VOLUME} && pdflatex ${VOLUME}

${DOCS}/atom.xml: bin/blog.js ${BLOG_POSTS} inc/post-head.html inc/post-foot.html
	bin/blog.js --root . --common ${COMMON_CONFIG} --source ${BLOG_SRC} --docs ${DOCS} --blog ${BLOG_DIR} --links ${LINKS_YML}

# ----------------------------------------------------------------------

# HTML file dependencies that don't map directly to index.md files in sub-directories.
${HOME_PAGE}: ${VOLUME}-intro/index.md
${DOCS}/${VOLUME}/conduct/index.html: CONDUCT.md
${DOCS}/${VOLUME}/contributing/index.html: CONTRIBUTING.md
${DOCS}/${VOLUME}/license/index.html: LICENSE.md
${DOCS}/${VOLUME}/authors/index.html: authors.md
${GLOSS_HTML}: ${GLOSS_MD}
${DOCS}/${VOLUME}/links/index.html: links.md
${DOCS}/${VOLUME}/%/index.html: %/index.md

# HTML file dependencies that do map to index.md files in sub-directories.
%/index.md: %/*/problem.md %/*/solution.md %/*.tbl %/figures/*.svg
	@touch $@

# Static files.
${DOCS}/static/%: static/%
	@mkdir -p $(dir $@)
	cp $< $@

# Static files in root directory.
${DOCS}/%: ./%
	@mkdir -p $(dir $@)
	cp $< $@

# Tools all depend on utilities.
${TOOLS}: bin/utils.js
bin/%.js:
	@touch $@

# ----------------------------------------------------------------------

# Can't use command-line to regenerate PDFs of diagrams from SVGs because the
# SVGs are saved as full pages (8.5"x11") and the '--crop' option crops to page
# size, not content size.
#
# %.pdf: %.svg
#	/Applications/draw.io.app/Contents/MacOS/draw.io --crop --export --format pdf --border 0 --scale 1.0 --output $@ $<
