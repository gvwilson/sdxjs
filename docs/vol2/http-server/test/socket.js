class Socket {
  constructor () {
    this.text = ''
  }

  write (data) {
    this.text += data
  }
}

export default Socket
