node socket-server.js ./always-send-success &
sleep 1
node simple-socket-client.js
kill %1
