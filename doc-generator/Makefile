TARGETS=\
  doc-comment.out \
  fill-in-headers.html \
  find-following.out \
  multi-line-double-slash-comment.out \
  multi-line-slash-star-comment.out \
  process-plain.html \
  two-kinds-of-comment.out \
  two-kinds-of-comment-subset.out

include ../_rules.mk

fill-in-headers.html: fill-in-headers-input.js
find-following.out: find-following-input.js
process-plain.html: example-plain.js util-plain.js
two-kinds-of-comment.out: extract-comments.js
two-kinds-of-comment-subset.out: extract-comments-subset.js
