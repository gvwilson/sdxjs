include _config.mk

STANDARDS=$(filter-out README.md,$(wildcard *.md))
STANDARDS_RELEASE=$(filter-out index.md,$(filter-out references.md,${STANDARDS}))
CHAPTERS=$(wildcard */index.md)
CHAPTER_FILES=$(wildcard $(patsubst %/index.md,%/*.*,${CHAPTERS})) $(wildcard $(patsubst %/index.md,%/*/*.*,${CHAPTERS}))
SOURCE=${STANDARDS} ${CHAPTER_FILES}
INCLUDES=$(wildcard _includes/*.html) $(wildcard _includes/*.md)

FIG_SVG=$(wildcard */figures/*.svg) $(wildcard */*/figures/*.svg) $(wildcard static/*.svg)
FIG_PDF=$(patsubst %.svg,%.pdf,${FIG_SVG})

# Controls
all : commands

## commands  : show all commands.
commands :
	@grep -h -E '^##' ${MAKEFILE_LIST} | sed -e 's/## //g' | column -t -s ':'

## serve     : rebuild site and serve it.
serve :
	rm -rf _site
	jekyll serve -I

## site      : rebuild site without serving it.
site : _site/index.html

_site/index.html : references.md _data/figures.yml ${INCLUDES}
	rm -rf .jekyll-cache .jekyll-metadata _site
	jekyll build

## bib       : regenerate Markdown bibliography from BibTeX.
bib : references.md

references.md : references.bib
	bin/bib2md.py < references.bib > references.md

## figures   : regenerate figure numbering index file.
figures : _data/figures.yml

_data/figures.yml : bin/fig2yaml.py bin/util.py ${SOURCE}
	python bin/fig2yaml.py \
	--lessons _data/lessons.yml \
	--standards _data/standards.yml \
	--extras _data/extras.yml \
	> _data/figures.yml

## book.tex  : make LaTeX source.
book.tex : bin/dom2tex.py bin/util.py etc/latex.template _site/index.html
	python bin/dom2tex.py \
	--title ${TITLE} \
	--subtitle ${SUBTITLE} \
	--author ${AUTHOR} \
	--date ${YEAR}/${VERSION} \
	--links _data/links.yml \
	--glossary _data/glossary.yml \
	--lessons _data/lessons.yml \
	--standards _data/standards.yml \
	--extras _data/extras.yml \
	--template etc/latex.template \
	--site _site \
	--output book.tex

## book.pdf  : make PDF from LaTeX source.
book.pdf : book.tex etc/settings.tex ${FIG_PDF}
	pdflatex --shell-escape book.tex
	bibtex book
	makeindex book
	pdflatex --shell-escape book
	pdflatex --shell-escape book

%.pdf : %.svg
	rsvg-convert -f pdf -o $@ $<

## ---- : ----

## config    : Regenerate configuration file.
config : bin/makeconfig.py etc/config.template _config.mk
	@bin/makeconfig.py \
	title=${TITLE} \
	subtitle=${SUBTITLE} \
	author=${AUTHOR} \
	year=${YEAR} \
	version=${VERSION} \
	email=${EMAIL} \
	domain=${DOMAIN} \
	repo=${REPO} \
	excludes='${EXCLUDES}' \
	< etc/config.template \
	> _config.yml

## links     : Check that all links resolve.
links :
	@bin/checklinks.py _data/links.yml _data/glossary.yml ${STANDARDS} ${CHAPTERS}

## clean     : Clean up stray files.
clean :
	rm -rf book.* .jekyll-cache .jekyll-metadata _site bin/__pycache__ _minted-book
	find . -name '*~' -exec rm {} \;

## release   : Create release of template.
release : clean
	@tar zcvf release.tar.gz \
	.gitignore \
	Makefile \
	_data/standards.yml \
	_includes \
	_layouts \
	static \
	bin \
	etc \
	favicon.ico \
	${STANDARDS_RELEASE}

## settings  : Show values of variables.
settings :
	@echo TITLE: ${TITLE}
	@echo YEAR: ${YEAR}
	@echo EMAIL: ${EMAIL}
	@echo DOMAIN: ${DOMAIN}
	@echo REPO: ${REPO}
	@echo EXCLUDES: ${EXCLUDES}
	@echo CHAPTERS: ${CHAPTERS}
	@echo EXERCISES: ${EXERCISES}
	@echo STANDARDS: ${STANDARDS}
	@echo SOURCE: ${SOURCE}

-include local.mk
