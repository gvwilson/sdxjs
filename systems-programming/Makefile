TARGETS=\
  copy-file-unfiltered.txt \
  glob-all-files.txt \
  glob-get-then-filter-pedantic.txt \
  list-dir-function-defined.txt \
  list-dir-wrong.txt

include ../rules.mk

list-dir-wrong.txt: list-dir-wrong.js list-dir-wrong.sh
	(bash list-dir-wrong.sh >& list-dir-wrong.txt) || true
