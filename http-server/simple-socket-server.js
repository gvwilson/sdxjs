const Net = require('net')

const port = 8080

const server = new Net.Server()

server.listen(port, () => {
  console.log(`server listening on localhost:${port}`)
})

server.on('connection', (socket) => {
  console.log('server new connection')

  socket.write('message from server')

  socket.on('data', (data) => {
    console.log(`server received from client: ${data.toString()}`)
  })

  socket.on('end', () => {
    console.log('server ending connection')
  })

  socket.on('close', () => {
    console.log('server closing socket')
  })

  socket.on('error', (err) => {
    console.log(`server error: ${err}`)
  })
})
