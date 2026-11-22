.PHONY: commands site serve check clean

QUARTO=quarto
DOCS=docs
JAVASCRIPT = $(wildcard */*.js) $(wildcard */x-*/*.js)

## commands: show available commands (*)
commands:
	@grep -h -E '^##' ${MAKEFILE_LIST} \
	| sed -e 's/## //g' \
	| column -t -s ':'

## site: render HTML with Quarto
site:
	${QUARTO} render --to html
	@touch ${DOCS}/.nojekyll

## serve: preview the site locally
serve:
	${QUARTO} preview

## check: check JavaScript code style
check:
	@npx standard ${JAVASCRIPT}

## clean: remove generated and cache files
clean:
	rm -rf .quarto _book
	find . -type f -name '*~' -delete
