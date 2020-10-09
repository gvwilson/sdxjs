TARGETS=\
  doc-comment.text \
  fill-in-headers.text \
  find-following.text \
  multi-line-double-slash-comment.text \
  multi-line-slash-star-comment.text \
  process-plain.html \
  two-kinds-of-comment.text \
  two-kinds-of-comment-subset.text

include ../rules.mk

fill-in-headers.html: fill-in-headers.sh fill-in-headers.js fill-in-headers-input.js
	bash $< > $@

find-following.text: find-following-input.js

process-plain.html: process-plain.sh process-plain.js example-plain.js util-plain.js
	bash $< > $@

two-kinds-of-comment.text: extract-comments.js

two-kinds-of-comment-subset.text: extract-comments-subset.js
