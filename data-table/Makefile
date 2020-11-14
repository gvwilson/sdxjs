TARGETS=\
  storage-performance-10000-30.txt \
  table-performance-100-03-03.txt \
  table-performance-10000-30-03.txt \
  table-performance-10000-30-10.txt

include ../_rules.mk

storage-performance-10000-30.txt: storage-performance.js
table-performance-100-03-03.txt: table-performance.js
table-performance-10000-30-03.txt: table-performance.js
table-performance-10000-30-10.txt: table-performance.js

storage-performance.js: build.js
table-performance.js: build.js
