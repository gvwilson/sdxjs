## ----

EXAMPLE_DIRS = $(patsubst %/Makefile,%,$(wildcard */Makefile))
JAVASCRIPT = $(wildcard */*.js) $(wildcard */x-*/*.js)

## examples: rebuild all examples in sub-directories (slow).
examples:
	@for d in ${EXAMPLE_DIRS}; do echo ""; echo $$d; make -C $$d; done

## standard: run checks on code formatting
standard:
	@npx standard ${JAVASCRIPT}
