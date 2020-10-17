class Socket {
  constructor () {
    this.text = ''
  }

  write (data) {
    this.text += data
  }
}

module.exports = Socket
