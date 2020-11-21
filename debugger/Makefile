TARGETS=\
  filter-base.txt \
  filter-source-map.txt \
  sum-source-map-trace.txt \
  test-exit.txt \
  test-expect.txt

include ../_rules.mk

filter-base.txt: filter-base.sh vm-base.js run-base.js filter-base.json
filter-source-map.txt: filter-source-map.sh vm-source-map.js run-base.js filter-source-map.json
sum-source-map-trace.txt: sum-source-map-trace.sh vm-interactive.js run-debugger.js debugger-trace.js sum-source-map.json

run-base.js: read-source.js
	@touch run-base.js

run-debugger.js: read-source.js
	@touch run-debugger.js
