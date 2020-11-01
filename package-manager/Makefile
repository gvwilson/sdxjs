TARGETS=\
  prune-double-chained.txt \
  prune-triple.txt \
  reverse-triple.txt \
  sweep-double-chained.txt \
  sweep-triple.txt

include ../_rules.mk

${TARGETS}: driver.js

prune-double-chained.txt: prune.js config-str.js double-chained.json

prune-triple.txt: prune.js config-str.js triple.json

reverse-triple.txt: reverse.js config-str.js triple.json

sweep-double-chained.txt: sweep.js config-str.js double-chained.json

sweep-triple.txt: sweep.js config-str.js triple.json
