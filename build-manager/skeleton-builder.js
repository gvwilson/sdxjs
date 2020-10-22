const assert = require('assert')

class SkeletonBuilder {
  constructor (configFile) {
    this.configFile = configFile
  }

  build () {
    this.loadConfig()
    this.buildGraph()
    this.checkCycles()
    this.run()
  }

  loadConfig () {
    assert(false, 'not implemented')
  }

  buildGraph () {
    assert(false, 'not implemented')
  }

  checkCycles () {
    assert(false, 'not implemented')
  }

  run () {
    assert.fail('run method not implemented')
  }
}

module.exports = SkeletonBuilder
