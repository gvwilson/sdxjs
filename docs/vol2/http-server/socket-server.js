const Net = require('net')

const handlerName = process.argv[2]
const handlerFactory = require(handlerName)

const port = 8080

const server = new Net.Server()

let numRequests = 0

server.listen(port, () => {
  console.log(`server listening on localhost:${port}`)
})

server.on('connection', (socket) => {
  numRequests += 1
  console.log(`server new connection ${numRequests}`)

  socket.on('data', handlerFactory(socket))

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
