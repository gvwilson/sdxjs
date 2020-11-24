import Middle from './middle.js'

class Lower extends Middle {
  report () {
    console.log(this.additional())
  }

  additional () {
    return 'lower'
  }
}

export default Lower
