node http-params-server.js &
sleep 1
echo '- - - - - - - - - - - - - - - - - - - -'
node http-params-client.js level=moderate
echo '- - - - - - - - - - - - - - - - - - - -'
node http-params-client.js unknown=something
kill %1
