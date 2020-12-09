TARGETS=\
  prune-double-chained.out \
  prune-triple.out \
  reverse-triple.out \
  sweep-double-chained.out \
  sweep-triple.out

include ../examples.mk

${TARGETS}: driver.js

prune-double-chained.out: prune.js config-str.js double-chained.json

prune-triple.out: prune.js config-str.js triple.json

reverse-triple.out: reverse.js config-str.js triple.json

sweep-double-chained.out: sweep.js config-str.js double-chained.json

sweep-triple.out: sweep.js config-str.js triple.json
