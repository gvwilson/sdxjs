node http-file-server.js . &
sleep 1
echo '- - - - - - - - - - - - - - - - - - - -'
node http-request-client.js /files/a.txt
echo '- - - - - - - - - - - - - - - - - - - -'
node http-request-client.js ../index.html
kill %1
