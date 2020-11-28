TARGETS =\
  does-the-loading.out \
  eval-global-structure.out \
  eval-global-vars.out \
  eval-local-vars.out \
  eval-loop.out \
  eval-two-plus-two.out \
  test-import-interpolate.out \
  test-import-left.out \
  test-import-right.out \
  test-simple.out \
  to-be-loaded.out

include ../_rules.mk

does-the-loading.out: to-be-loaded.js

test-import-interpolate.out: caching.js import-interpolate.js import-interpolate-topmethod.js import-interpolate-bottommethod.js

test-import-left.out: need-path.js modules/imported-left.js

test-import-right.out: need-path.js modules/imported-right.js modules/imported-left.js

test-simple.out: need-simple.js import-simple.js
