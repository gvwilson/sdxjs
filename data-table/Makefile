TARGETS=\
  packed-cols-10000-30.out \
  packed-rows-10000-30.out \
  storage-performance-10000-30.out \
  table-performance-100-03-03.out \
  table-performance-10000-30-03.out \
  table-performance-10000-30-10.out

include ../_rules.mk

packed-cols-10000-30.out: packed-cols.js
packed-rows-10000-30.out: packed-rows.js
storage-performance-10000-30.out: storage-performance.js
table-performance-100-03-03.out: table-performance.js
table-performance-10000-30-03.out: table-performance.js
table-performance-10000-30-10.out: table-performance.js

packed-cols.js: build.js
packed-rows.js: build.js
storage-performance.js: build.js
table-performance.js: build.js
