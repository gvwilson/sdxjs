.PHONY: docs

EXAMPLES_INCLUDE = '*.as' '*.bck' '*.js' '*.json' '*.mx' '*.out' '*.py' '*.sh' '*.txt' '*.yml'
JAVASCRIPT = $(wildcard src/*/*.js) $(wildcard src/*/x-*/*.js)

all: commands

## commands: show available commands (*)
commands:
	@grep -h -E '^##' ${MAKEFILE_LIST} \
	| sed -e 's/## //g' \
	| column -t -s ':'

## check: run checks on code formatting
check:
	@npx standard ${JAVASCRIPT}

## clean: clean up
clean:
	@find . -path ./.venv -prune -o -type f -name '*~' -exec rm {} +

## html: check HTML
html:
	@mccole check --src . --dst docs

## serve: serve documentation
serve:
	python -m http.server -d docs

## site: build documentation
site:
	@mccole build --src . --dst docs
	@touch docs/.nojekyll
