TARGETS=\
  hash-file.txt \
  hash-stream.txt \
  hash-text.txt \
  run-hash-existing-async.txt \
  run-hash-existing-promise.txt \
  test-backup.txt \
  test-check-filesystem.txt \
  tree-test.txt

include ../_rules.mk

test-backup.sh: test/test-backup.js
	@touch $@

test-check-filesystem.sh: test/test-find.js test/test-find-mock.js
	@touch $@
