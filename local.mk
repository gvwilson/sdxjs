## ----

EXAMPLE_DIRS = $(patsubst %/Makefile,%,$(wildcard */Makefile))
JAVASCRIPT = $(wildcard */*.js) $(wildcard */x-*/*.js)
HTML = _site/index.html $(wildcard _site/*/index.html)

## examples: rebuild all examples in sub-directories (slow).
examples:
	@for d in ${EXAMPLE_DIRS}; do echo ""; echo $$d; make -C $$d; done

## long-lines: report overly-long lines in JavaScript files
long-lines:
	@bin/check-long-lines.py --source ${JAVASCRIPT}

## standard: run checks on code formatting
standard:
	@npx standard ${JAVASCRIPT}
