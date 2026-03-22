import assert from 'assert'

class Expect {
  constructor (subject, start) {
    this.start = start
    this.steps = []
    subject.setTester(this)
  }

  send (text) {
    this.steps.push({ op: 'toSystem', arg: text })
    return this
  }

  get (text) {
    this.steps.push({ op: 'fromSystem', arg: text })
    return this
  }

  run () {
    this.start()
    assert.strictEqual(this.steps.length, 0,
      'Extra steps at end of test')
  }

  toSystem () {
    return this.next('toSystem')
  }

  fromSystem (actual) {
    const expected = this.next('fromSystem')
    assert.strictEqual(expected, actual,
      `Expected "${expected}" got "${actual}"`)
  }

  next (kind) {
    assert(this.steps.length > 0,
      'Unexpected end of steps')
    assert.strictEqual(this.steps[0].op, kind,
      `Expected ${kind}, got "${this.steps[0].op}"`)
    const text = this.steps[0].arg
    this.steps = this.steps.slice(1)
    return text
  }
}

export default Expect
