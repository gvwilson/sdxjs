TARGETS=\
  bundle-full.js \
  bundle-single.js \
  bundle-simple.js \
  expected-full.out \
  expected-simple.out \
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
test-transitive-closure-only.out: transitive-closure-only.out
test-transitive-closure.out: transitive-closure.out

bundle-full.js: test-create-bundle-full.sh test-create-bundle.js create-bundle.js transitive-closure.js $(wildcard full/*.js) $(wildcard full/*/*.js)
	bash test-create-bundle-full.sh

bundle-simple.js: test-create-bundle-simple.sh test-create-bundle.js create-bundle.js transitive-closure.js $(wildcard simple/*.js)
	bash test-create-bundle-simple.sh

bundle-single.js: test-create-bundle-single.sh test-create-bundle.js create-bundle.js transitive-closure.js $(wildcard single/*.js)
	bash test-create-bundle-single.sh

test-combine-files-simple.js: test-combine-files-simple.sh combine-files.js test-combine-files.js test-combine-files-simple.sh $(wildcard simple/*.js)
	bash test-combine-files-simple.sh

test-combine-files-single.js: test-combine-files-single.sh combine-files.js test-combine-files.js test-combine-files-single.sh $(wildcard single/*.js)
	bash test-combine-files-single.sh
