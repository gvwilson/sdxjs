node test-base-http-server.js &
sleep 1
node http-request-client.js
kill %1
