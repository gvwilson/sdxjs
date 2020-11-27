TARGETS=\
  hash-file.out \
  hash-stream.out \
  hash-text.out \
  run-hash-existing-async.slice.out \
  run-hash-existing-promise.slice.out \
  test-backup.out \
  test-check-filesystem.out \
  tree-test.out

include ../_rules.mk

test-backup.sh: test/test-backup.js
	@touch $@

test-check-filesystem.sh: test/test-find.js test/test-find-mock.js
	@touch $@
