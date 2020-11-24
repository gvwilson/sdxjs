TARGETS=\
  dry-run.out \
  pray.out

include ../_rules.mk

pray.out: pray-wrap.sh pray.sh pray.js
	bash $< > $@
