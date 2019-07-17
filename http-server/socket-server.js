const Net = require('net')

const handlerName = process.argv[2]
const handlerFactory = require(handlerName)

const port = 8080

const server = new Net.Server()

let num_requests = 0

server.listen(port, () => {
  console.log(`server listening on localhost:${port}`)
})

server.on('connection', (socket) => {
  num_requests += 1
  console.log(`server new connection ${num_requests}`)

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
