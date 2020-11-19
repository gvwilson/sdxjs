TARGETS=\
  count-up-out.txt \
  fill-array-out.txt \
  halt-out.txt \
  print-r1-out.txt

include ../_rules.mk

%-out.txt: %.mx run.js vm.js
	node run.js $< show > $@

%.mx: %.sh %.as as.js
	bash $<

count-up.mx: assembler.js
fill-array.mx: allocate-data.js
halt.mx: assembler.js
print-r1.mx: assembler.js

vm.js: vm-base.js
	@touch vm.js
