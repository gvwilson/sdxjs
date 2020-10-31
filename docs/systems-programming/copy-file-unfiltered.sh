rm -rf /tmp/out
mkdir /tmp/out
node copy-file-unfiltered.js ../node_modules /tmp/out 2>&1 \
    | ../_tools/wrap.js \
    | head -n 6
