class Env {
  constructor (initial) {
    this.stack = []
    this.push(Object.assign({}, initial))
  }

  push (frame) {
    this.stack.push(frame)
  }

  pop () {
    this.stack.pop()
  }

  find (name) {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      if (name in this.stack[i]) {
        return this.stack[i][name]
      }
    }
    return undefined
  }

  toString () {
    return JSON.stringify(this.stack)
  }
}

export default Env
