all: commands

commands:
	@make -f vol1.mk commands

clean:
	@make -f vol1.mk clean

html:
	@make -f vol1.mk html

pdf:
	@make -f vol1.mk pdf

serve:
	@make -f vol1.mk serve
