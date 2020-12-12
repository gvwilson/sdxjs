TARGETS=\
  test-easy-mode.out \
  test-placed.out \
  test-rendered.out \
  test-wrapped.out

include ../examples.mk

test-easy-mode.out: test/test-easy-mode.js easy-mode.js
test-placed.out: test/test-placed.js placed.js
test-rendered.out: test/test-rendered.js rendered.js render.js
test-wrapped.out: test/test-wrapped.js wrapped.js

wrapped.js: rendered.js
rendered.js: placed.js
placed.js: easy-mode.js
