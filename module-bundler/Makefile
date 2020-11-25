TARGETS=\
  bundle-full.js \
  bundle-single.js \
  bundle-simple.js \
  expected-full.out \
  expected-simple.out \
  expected-single.out \
  sanity-check-test.out \
  show-combine-files-simple.out \
  test-bundle-full.out \
  test-bundle-simple.out \
  test-bundle-single.out \
  test-combine-files-single.js \
  test-combine-files-simple.js \
  test-get-requires.out \
  test-transitive-closure.out \
  test-transitive-closure-only.out

include ../_rules.mk

show-combine-files-simple.out: test-combine-files-simple.js show-combine-files-simple.sh

test-transitive-closure.sh: test-transitive-closure.js full/main.js
	@touch $@

test-transitive-closure.js: transitive-closure.js
	@touch $@

test-transitive-closure-only.sh: test-transitive-closure-only.js full/main.js
	@touch $@

test-transitive-closure-only.js: transitive-closure-only.js
	@touch $@

bundle-full.js: test-create-bundle-full.sh test-create-bundle.js $(wildcard full/*.js) $(wildcard full/*/*.js)
	bash test-create-bundle-full.sh

bundle-simple.js: test-create-bundle-simple.sh test-create-bundle.js $(wildcard simple/*.js)
	bash test-create-bundle-simple.sh

bundle-single.js: test-create-bundle-single.sh test-create-bundle.js $(wildcard single/*.js)
	bash test-create-bundle-single.sh

test-combine-files-simple.js: test-combine-files-simple.sh test-combine-files.js $(wildcard simple/*.js)
	bash test-combine-files-simple.sh

test-combine-files-single.js: test-combine-files-single.sh test-combine-files.js $(wildcard single/*.js)
	bash test-combine-files-single.sh

test-combine-files.js: combine-files.js
	@touch $@

test-create-bundle.js: create-bundle.js
	@touch $@

create-bundle.js: transitive-closure.js
	@touch $@

test-bundle-single.out: test-bundle-single.sh bundle-single.js

test-bundle-simple.out: test-bundle-simple.sh bundle-simple.js

test-bundle-full.out: test-bundle-full.sh bundle-full.js
