node socket-server.js ./http-response-success &
sleep 1
node http-request-client.js
kill %1
