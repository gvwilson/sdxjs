TARGETS=\
  doc-comment.txt \
  fill-in-headers.txt \
  find-following.txt \
  multi-line-double-slash-comment.txt \
  multi-line-slash-star-comment.txt \
  process-plain.html \
  two-kinds-of-comment.txt \
  two-kinds-of-comment-subset.txt

include ../rules.mk

fill-in-headers.html: fill-in-headers.sh fill-in-headers.js fill-in-headers-input.js
	bash $< > $@

find-following.txt: find-following-input.js

process-plain.html: process-plain.sh process-plain.js example-plain.js util-plain.js
	bash $< > $@

two-kinds-of-comment.txt: extract-comments.js

two-kinds-of-comment-subset.txt: extract-comments-subset.js
