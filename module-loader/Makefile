TARGETS =\
  does-the-loading.txt \
  eval-global-structure.txt \
  eval-global-vars.txt \
  eval-local-vars.txt \
  eval-loop.txt \
  eval-two-plus-two.txt \
  test-import-interpolate.txt \
  test-import-left.txt \
  test-import-right.txt \
  test-simple.txt \
  to-be-loaded.txt

include ../rules.mk

test-import-interpolate.txt: caching.js import-interpolate.js import-interpolate-topmethod.js import-interpolate-bottommethod.js

test-import-left.txt: need-path.js modules/imported-left.js

test-import-right.txt: need-path.js modules/imported-right.js modules/imported-left.js

test-simple.txt: need-simple.js import-simple.js

to-be-loaded.txt: to-be-loaded.js
	(bash to-be-loaded.sh >& to-be-loaded.txt) || true
