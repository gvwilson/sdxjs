TARGETS=\
  capture-exports-encapsulate.txt \
  capture-exports-pollute.txt \
  concatenate-by-hand.txt \
  concatenate-programmatically-output-test.txt \
  extract-require.txt \
  full/expected.txt \
  simple/expected.txt \
  transitive-closure.txt \
  transitive-closure-only.txt

include ../rules.mk

concatenate-programmatically-output.js: concatenate-programmatically.sh concatenate-programmatically.js
	bash $< > $@

concatenate-programmatically-output-test.txt: concatenate-programmatically-output-test.js concatenate-programmatically-output.js
	node $< > $@
