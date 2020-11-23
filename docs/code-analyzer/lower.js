const Middle = require('./middle')

class Lower extends Middle {
  report () {
    console.log(this.additional())
  }

  additional () {
    return 'lower'
  }
}

module.exports = Lower
