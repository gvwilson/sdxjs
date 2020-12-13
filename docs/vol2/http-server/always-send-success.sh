node socket-server.js ./always-send-success.js &
sleep 1
node simple-socket-client.js
kill %1
