TARGETS=\
  dry-run.txt \
  pray.txt

include ../_rules.mk

pray.txt: pray-wrap.sh pray.sh pray.js
	bash $< > $@
