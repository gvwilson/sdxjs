const Header = `HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 7

` // end Header

const handlerFactory = (socket) => (data) => {
  console.log(`server received from client: ${data.toString()}`)
  socket.write(Header + 'SUCCESS')
}

export default handlerFactory
