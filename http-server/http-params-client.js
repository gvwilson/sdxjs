const net = require('net')

const query = (process.argv.length > 2)
      ? '?' + process.argv.slice(2)
      : ''

const request = `GET /${query} HTTP/1.1

`

const client = new net.Socket()
client.connect(8080, '127.0.0.1', () => {
  client.write(request)
  client.end()
})

client.on('data', (data) => {
  console.log('client receives:')
  console.log(data.toString())
})

client.on('close', () => {
})
