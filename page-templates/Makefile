TOOLS=template.js expander.js visitor.js env.js 

TARGETS=\
  output-static-text.html \
  output-single-constant.html \
  output-single-variable.html \
  output-multiple-variables.html \
  output-conditional.html \
  output-loop.html

output-%.html: %.sh input-%.html vars.json ${TOOLS}
	bash $< > $@

include ../examples.mk
