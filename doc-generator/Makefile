TARGETS=\
  doc-comment.txt \
  fill-in-headers.html \
  find-following.txt \
  multi-line-double-slash-comment.txt \
  multi-line-slash-star-comment.txt \
  process-plain.html \
  two-kinds-of-comment.txt \
  two-kinds-of-comment-subset.txt

include ../rules.mk

fill-in-headers.html: fill-in-headers-input.js
find-following.txt: find-following-input.js
process-plain.html: example-plain.js util-plain.js
two-kinds-of-comment.txt: extract-comments.js
two-kinds-of-comment-subset.txt: extract-comments-subset.js
