echo '// eslint-disable' > test-combine-files-simple.js
node test-combine-files.js simple/main.js simple/other.js >> test-combine-files-simple.js
