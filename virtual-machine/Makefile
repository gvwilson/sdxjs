TARGETS=\
  count-up-out.out \
  fill-array-out.out \
  halt-out.out \
  print-r1-out.out

include ../_rules.mk

%-out.out: %.mx run.js vm.js
	node run.js $< show > $@

%.mx: %.sh %.as as.js
	bash $<

count-up.mx: assembler.js
fill-array.mx: allocate-data.js
halt.mx: assembler.js
print-r1.mx: assembler.js

vm.js: vm-base.js
	@touch vm.js
