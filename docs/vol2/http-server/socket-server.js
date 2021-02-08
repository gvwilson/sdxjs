import Net from 'net'

const PORT = 8080

const main = async () => {
  const handlerName = process.argv[2]
  const handlerFactory = (await import(handlerName)).default

  const server = new Net.Server()

  let numRequests = 0

  server.listen(PORT, () => {
    console.log(`server listening on localhost:${PORT}`)
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
}

main()
