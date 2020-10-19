all: ${TARGETS}

targets:
	@echo ${TARGETS}

%.html: %.sh %.js
	bash $< &> $@

%.html: %.sh
	bash $< &> $@

%.html: %.js
	node $< &> $@

%.txt: %.sh %.js
	bash $< &> $@

%.txt: %.sh
	bash $< &> $@

%.txt: %.js
	node $< &> $@

erase:
	rm -f ${TARGETS}
