TARGETS=\
  count-up.mx \
  halt.mx \
  print-r1.mx

include ../_rules.mk

%.mx: %.sh %.as as.js
	bash $< > $@
