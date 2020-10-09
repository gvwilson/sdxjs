all: ${TARGETS}

targets:
	@echo ${TARGETS}

%.text: %.sh %.js
	bash $< > $@

%.text: %.sh
	bash $< > $@

%.text: %.js
	node $< > $@
