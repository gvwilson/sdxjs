class Pledge {
  constructor (action) {
    this.actionCallbacks = []
    this.errorCallback = () => {}
    action(this.onResolve.bind(this), this.onReject.bind(this))
  }

  then (thenHandler) {
    this.actionCallbacks.push(thenHandler)
    return this
  }

  catch (errorHandler) {
    this.errorCallback = errorHandler
    return this
  }

  onResolve (value) {
    let storedValue = value
    try {
      this.actionCallbacks.forEach((action) => {
        storedValue = action(storedValue)
      })
    } catch (error) {
      this.actionCallbacks = []
      this.onReject(error)
    }
  }

  onReject (error) {
    this.errorCallback(error)
  }
}

module.exports = Pledge
