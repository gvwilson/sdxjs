node socket-server.js ./http-response-parse &
sleep 1
node http-request-client.js ../files/private.txt
kill %1
