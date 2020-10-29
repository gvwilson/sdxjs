TARGETS=\
  bundle-full.js \
  bundle-single.js \
  bundle-simple.js \
  expected-full.txt \
  expected-simple.txt \
  sanity-check-test.txt \
  show-combine-files-simple.txt \
  test-bundle-full.txt \
  test-bundle-simple.txt \
  test-bundle-single.txt \
  test-combine-files-single.js \
  test-combine-files-simple.js \
  test-get-requires.txt \
  test-transitive-closure.txt \
  test-transitive-closure-only.txt

include ../_rules.mk

show-combine-files-simple.txt: test-combine-files-simple.js show-combine-files-simple.sh
test-transitive-closure-only.txt: transitive-closure-only.txt
test-transitive-closure.txt: transitive-closure.txt

bundle-full.js: test-create-bundle.js create-bundle.js transitive-closure.js $(wildcard full/*.js) $(wildcard full/*/*.js)
	bash test-create-bundle-full.sh

bundle-simple.js: test-create-bundle.js create-bundle.js transitive-closure.js $(wildcard simple/*.js)
	bash test-create-bundle-simple.sh

bundle-single.js: test-create-bundle.js create-bundle.js transitive-closure.js $(wildcard single/*.js)
	bash test-create-bundle-single.sh

test-combine-files-simple.js: combine-files.js test-combine-files.js test-combine-files-simple.sh $(wildcard simple/*.js)
	bash test-combine-files-simple.sh

test-combine-files-single.js: combine-files.js test-combine-files.js test-combine-files-single.sh $(wildcard single/*.js)
	bash test-combine-files-single.sh
