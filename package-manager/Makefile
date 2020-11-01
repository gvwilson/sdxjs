TARGETS=\
  prune-double-chained.txt \
  prune-triple.txt \
  sweep-double-chained.txt \
  sweep-triple.txt

include ../_rules.mk

${TARGETS}: driver.js

prune-double-chained.txt: prune.js config-str.js double-chained.json

sweep-double-chained.txt: sweep.js config-str.js double-chained.json
