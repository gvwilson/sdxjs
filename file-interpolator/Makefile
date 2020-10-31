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

include ../_rules.mk

test-import-interpolate.txt: caching.js import-interpolate.js import-interpolate-topmethod.js import-interpolate-bottommethod.js

test-import-left.txt: test-import-left-wrapped.sh test-import-left.sh need-path.js modules/imported-left.js
	bash $< >& $@

test-import-right.txt: need-path.js modules/imported-right.js modules/imported-left.js

test-simple.txt: need-simple.js import-simple.js

to-be-loaded.txt: to-be-loaded.js
