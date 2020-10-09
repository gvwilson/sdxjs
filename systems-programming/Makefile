TARGETS=\
  copy-file-unfiltered.text \
  glob-all-files.text \
  glob-get-then-filter-pedantic.text \
  list-dir-function-defined.text \
  list-dir-wrong.text

include ../rules.mk

list-dir-wrong.text: list-dir-wrong.js list-dir-wrong.sh
	(bash list-dir-wrong.sh >& list-dir-wrong.text) || true
