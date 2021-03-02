## ----

EXAMPLE_DIRS = $(patsubst %/Makefile,%,$(wildcard */Makefile))

## examples: rebuild all examples in sub-directories (slow).
examples:
	@for d in ${EXAMPLE_DIRS}; do echo ""; echo $$d; make -C $$d; done

## chunk-length: report lengths of included chunks
chunk-length: ${HTML}
	@bin/chunk-length.js ${HTML}

## long-lines: report overly-long lines in JavaScript files
long-lines:
	@bin/long-lines.js ${JAVASCRIPT}

## standard: run checks on code formatting
standard:
	@npx standard ${JAVASCRIPT} bin/*.js
