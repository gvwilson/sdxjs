node http-json-server.js &
sleep 1
echo '- - - - - - - - - - - - - - - - - - - -'
node got-json-client.js http://localhost:8080/ testing
kill %1
