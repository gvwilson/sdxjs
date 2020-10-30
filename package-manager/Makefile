TARGETS=\
  sweep-double-chained.txt \
  sweep-triple.txt

include ../_rules.mk

${TARGETS}: driver.js
sweep-double-chained.txt: sweep.js double-chained.json

sweep.js: allows.js config-str.js
	@touch sweep.js
