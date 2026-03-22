TARGETS=\
  doc-comment.out \
  fill-in-headers.html \
  find-following.out \
  multi-line-double-slash-comment.out \
  multi-line-slash-star-comment.out \
  process-plain.html \
  two-kinds-of-comment.out \
  two-kinds-of-comment-subset.out

include ../examples.mk

fill-in-headers.html: fill-in-headers.sh fill-in-headers.js fill-in-headers-input.js
	bash $< > $@

process-plain.html: process-plain.sh process-plain.js example-plain.js util-plain.js
	bash $< > $@

find-following.out: find-following-input.js
two-kinds-of-comment.out: extract-comments.js
two-kinds-of-comment-subset.out: extract-comments-subset.js
