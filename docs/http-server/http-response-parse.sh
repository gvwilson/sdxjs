node socket-server.js ./http-response-parse &
sleep 1
node http-request-client.js files/a.txt
kill %1
