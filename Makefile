# Default volume.
ifndef VOL
VOL := vol1
endif

# Numbering file for this volume.
NUMBERING := docs/${VOL}/numbering.js

# Chapter and appendix slugs.
SLUGS := $(shell bin/info.js --site site.yml --volume ${VOL}.yml --get slugs)

# Markdown source files for this volume.
MARKDOWN := $(patsubst %,%/index.md,${SLUGS})
ALL_MARKDOWN := $(wildcard *.md) $(wildcard */index.md)

# HTML output files.
HTML := $(patsubst %,docs/${VOL}/%/index.html,${SLUGS})

# Exercise files.
EXERCISES := $(wildcard $(patsubst %,%/x-*/*.md,${SLUGS}))
ALL_EXERCISES := $(wildcard */x-*/*.md)

# Example files
EXAMPLES_SRC := \
  $(wildcard $(patsubst %,%/*.as,${SLUGS})) \
  $(wildcard $(patsubst %,%/*.html,${SLUGS})) \
  $(wildcard $(patsubst %,%/*.js,${SLUGS})) \
  $(wildcard $(patsubst %,%/*.json,${SLUGS})) \
  $(wildcard $(patsubst %,%/*.mx,${SLUGS})) \
  $(wildcard $(patsubst %,%/*.out,${SLUGS})) \
  $(wildcard $(patsubst %,%/*.py,${SLUGS})) \
  $(wildcard $(patsubst %,%/*.sh,${SLUGS})) \
  $(wildcard $(patsubst %,%/*.yml,${SLUGS}))
EXAMPLES_DST := $(patsubst %,docs/${VOL}/%,${EXAMPLES_SRC})

# Directories with examples to rebuild.
EXAMPLE_DIRS := $(patsubst %/Makefile,%,$(wildcard */Makefile))

# Figures (input and output).
FIGURES_SRC := $(wildcard $(patsubst %,%/figures/*.svg,${SLUGS}))
FIGURES_DST := $(patsubst %,docs/${VOL}/%,${FIGURES_SRC})

# EJS inclusions.
INCLUSIONS := $(wildcard inc/*.html)

# Complete list of JavaScript source files.
JAVASCRIPT := \
  $(wildcard $(patsubst %,%/*.js,${SLUGS})) \
  $(wildcard $(patsubst %,%/*/*.js,${SLUGS}))

# Static files (input and output).
STATIC_SRC := .nojekyll CNAME favicon.ico index.html \
  $(wildcard static/*.*) \
  $(wildcard static/fonts/*/*.*)
STATIC_DST := $(patsubst %,docs/%,${STATIC_SRC})

# Tools used to create and update things.
TOOLS := $(filter-out bin/utils.js,$(wildcard bin/*.js))

# Blog posts.
BLOG_POSTS = $(wildcard posts/*.md)

# Everything.
ALL_TARGETS := ${FIGURES_DST} ${STATIC_DST} ${HTML} ${EXAMPLES_DST} docs/atom.xml

# ----------------------------------------------------------------------

.DEFAULT: commands

## commands: show available commands.
commands:
	@grep -h -E '^##' ${MAKEFILE_LIST} | sed -e 's/## //g' | column -t -s ':'

## examples: rebuild all examples in sub-directories (slow).
examples:
	@for d in ${EXAMPLE_DIRS}; do echo ""; echo $$d; make -C $$d; done

## html: rebuild HTML without serving.
html: ${ALL_TARGETS}

## serve: run a server on port 4000
serve: ${ALL_TARGETS}
	@npm run serve

## pdf: rebuild PDF
pdf: ${VOL}.pdf

## epub: rebuild EPUB
epub: docs/${VOL}/${VOL}.epub

## blog: rebuild blog
blog: docs/atom.xml

## ----: ----

## catalog: list all nodes and attributes
catalog:
	@bin/catalog.js --ignore --input ${HTML}

## check: check that files match style rules
check: ${HOME_PAGE}
	@bin/check.js \
	--site site.yml \
	--volume ${VOL}.yml \
	--output docs/${VOL} \
	--slugs ${SLUGS}

## chunk-length: report lengths of included chunks
chunk-length: ${HTML}
	@bin/chunk-length.js ${HTML}

## clean: clean up
clean:
	@rm -f ${VOL}.{aux,log,out,pdf,tex,toc}
	@rm -rf tmp
	@find . -name '*~' -exec rm {} \;

## duplicate-links: report duplicated hyperlinks within chapters
duplicate-links:
	@bin/duplicate-links.js ${MARKDOWN}

## ejslint: run checks on template expansions
ejslint:
	@npm run ejslint

## long-lines: report overly-long lines in JavaScript files
long-lines:
	@bin/long-lines.js ${JAVASCRIPT}

## standard: run checks on code formatting
standard:
	@npx standard ${JAVASCRIPT} bin/*.js

## pages: count pages per chapter.
pages: ${VOL}.aux
	@bin/pages.js ${VOL}.aux | column -t -s '|'

## settings: show all settings.
settings:
	@echo "EXAMPLES_DST =" ${EXAMPLES_DST}
	@echo "EXAMPLES_SRC =" ${EXAMPLES_SRC}
	@echo "EXERCISES =" ${EXERCISES}
	@echo "FIGURES_DST =" ${FIGURES_DST}
	@echo "FIGURES_SRC =" ${FIGURES_SRC}
	@echo "GLOSSARY_SOURCES =" ${GLOSSARY_SOURCES}
	@echo "HTML =" ${HTML}
	@echo "JAVASCRIPT =" ${JAVASCRIPT}
	@echo "LINKS_TABLE =" ${LINKS_TABLE}
	@echo "MARKDOWN =" ${MARKDOWN}
	@echo "SLUGS =" ${SLUGS}
	@echo "STATIC_DST =" ${STATIC_DST}
	@echo "STATIC_SRC =" ${STATIC_SRC}
	@echo "TOOLS =" ${TOOLS}

## terms: which terms are defined in which files?
terms:
	@bin/terms.js --glossary tmp/gloss.yml --input $(filter-out gloss/index.md,${MARKDOWN})

## word-list: what words are used in prose?
word-list: tmp/gloss.yml
	@bin/word-list.js --input ${HTML}

# ----------------------------------------------------------------------

# Numbering file for a volume.
${NUMBERING}: ${VOL}.yml bin/numbering.js
	@mkdir -p docs/${VOL}
	bin/numbering.js \
	--volume $< \
	--output $@

# bib/index.md: bibliography as Markdown.
bib/index.md: bib.yml bin/bib.js
	@mkdir -p bib
	bin/bib.js \
	--input $< \
	--output $@

# gloss/index.md: glossary as YAML.
gloss/index.md: tmp/gloss.yml bin/make-gloss-markdown.js
	@mkdir -p gloss
	bin/make-gloss-markdown.js \
	--input $< \
	--output $@

# tmp/gloss.yml: glossary as YAML.
GLOSSARY_SOURCES := $(filter-out gloss/index.md,${ALL_MARKDOWN}) ${ALL_EXERCISES}
tmp/gloss.yml: gloss.yml bin/make-gloss-yaml.js ${GLOSSARY_SOURCES}
	@mkdir -p tmp
	bin/make-gloss-yaml.js \
	--input $< \
	--output tmp/gloss.yml \
	--files ${GLOSSARY_SOURCES}

# HTML output file.
docs/${VOL}/%/index.html: %/index.md bin/html.js $(wildcard %/x-*/*.md) links.yml tmp/gloss.yml ${NUMBERING} ${INCLUSIONS}
	bin/html.js \
	--site site.yml \
	--volume ${VOL}.yml \
	--input $< \
	--output $@ \
	--links links.yml \
	--numbering ${NUMBERING} \
	--glossary tmp/gloss.yml

# LaTeX version of book.
${VOL}.tex: bin/latex.js ${HTML} ${TEX}
	bin/latex.js \
	--site site.yml \
	--volume ${VOL}.yml \
	--output ${VOL}.tex \
	--head tex/head.tex \
	--foot tex/foot.tex \
	--root docs/${VOL} \
	--numbering docs/${VOL}/numbering.js

# PDF version of book.
${VOL}.pdf ${VOL}.aux: ${VOL}.tex
	@pdflatex ${VOL} && pdflatex ${VOL} && pdflatex ${VOL}

# EPUB version of book.
docs/${VOL}/${VOL}.epub: ${VOL}.tex
	sed -e 's/\.pdf}/\.svg}/g' $< | pandoc --from latex --to epub > $@

# Blog (post generated as side effect).
docs/atom.xml: bin/blog.js ${BLOG_POSTS} inc/post-head.html inc/post-foot.html
	bin/blog.js \
	--site site.yml \
	--docs docs \
	--blog blog \
	--links links.yml \
	--posts ${BLOG_POSTS}

# Rearranging files.
license/index.md: LICENSE.md
	@mkdir -p license
	cp $< $@
conduct/index.md: CONDUCT.md
	@mkdir -p conduct
	cp $< $@
contributing/index.md: CONTRIBUTING.md
	@mkdir -p contributing
	cp $< $@

# Static files.
docs/static/%: static/%
	@mkdir -p $(dir $@)
	cp $< $@

# Static files in root directory.
docs/%: ./%
	@mkdir -p $(dir $@)
	cp $< $@

# SVG figures.
docs/${VOL}/%.svg: %.svg
	@mkdir -p $(dir $@)
	cp $< $@

# Miscellaneous example files.
docs/${VOL}/%.as: %.as
	@mkdir -p $(dir $@)
	cp $< $@
docs/${VOL}/%.html: %.html
	@mkdir -p $(dir $@)
	cp $< $@
docs/${VOL}/%.js: %.js
	@mkdir -p $(dir $@)
	cp $< $@
docs/${VOL}/%.json: %.json
	@mkdir -p $(dir $@)
	cp $< $@
docs/${VOL}/%.mx: %.mx
	@mkdir -p $(dir $@)
	cp $< $@
docs/${VOL}/%.out: %.out
	@mkdir -p $(dir $@)
	cp $< $@
docs/${VOL}/%.py: %.py
	@mkdir -p $(dir $@)
	cp $< $@
docs/${VOL}/%.sh: %.sh
	@mkdir -p $(dir $@)
	cp $< $@
docs/${VOL}/%.yml: %.yml
	@mkdir -p $(dir $@)
	cp $< $@

# Tools.
${TOOLS}: bin/utils.js
	touch $@
