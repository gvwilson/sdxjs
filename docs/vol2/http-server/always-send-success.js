const handlerFactory = (socket) => (data) => {
  console.log(`server received from client: ${data.toString()}`)
  socket.write('SUCCESS')
}

export default handlerFactory
