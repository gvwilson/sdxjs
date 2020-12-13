import Net from 'net'

const client = new Net.Socket()
client.connect(8080, '127.0.0.1', () => {
  console.log('client connected')
  client.write('message from client')
})

client.on('data', (data) => {
  console.log(`client received ${data}`)
  client.destroy()
})

client.on('close', () => {
  console.log('client connection closed')
})
