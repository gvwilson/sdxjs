TARGETS =\
  does-the-loading.text \
  eval-global-structure.text \
  eval-global-vars.text \
  eval-local-vars.text \
  eval-loop.text \
  eval-two-plus-two.text \
  test-import-interpolate.text \
  test-import-left.text \
  test-import-right.text \
  test-simple.text \
  to-be-loaded.text

include ../rules.mk

test-import-interpolate.text: caching.js import-interpolate.js import-interpolate-topmethod.js import-interpolate-bottommethod.js

test-import-left.text: need-path.js modules/imported-left.js

test-import-right.text: need-path.js modules/imported-right.js modules/imported-left.js

test-simple.text: need-simple.js import-simple.js

to-be-loaded.text: to-be-loaded.js
	(bash to-be-loaded.sh >& to-be-loaded.text) || true
