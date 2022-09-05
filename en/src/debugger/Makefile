TARGETS=\
  filter-base.out \
  filter-source-map.out \
  sum-source-map-trace.out \
  test-exit.out \
  test-expect.out

include ../examples.mk

filter-base.out: filter-base.sh vm-base.js run-base.js filter-base.json
filter-source-map.out: filter-source-map.sh vm-source-map.js run-base.js filter-source-map.json
sum-source-map-trace.out: sum-source-map-trace.sh vm-interactive.js run-debugger.js debugger-trace.js sum-source-map.json

run-base.js: read-source.js
	@touch run-base.js

run-debugger.js: read-source.js
	@touch run-debugger.js
