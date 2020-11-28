echo '$ node'
echo "> require('./major')"
echo "require('./major')" | node 2>&1 | ../../_tools/wrap.js
