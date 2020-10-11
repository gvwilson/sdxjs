all: ${TARGETS}

targets:
	@echo ${TARGETS}

%.txt: %.sh %.js
	bash $< > $@

%.txt: %.sh
	bash $< > $@

%.txt: %.js
	node $< > $@
