import assert from 'assert'
import caller from 'caller'

class Hope {
  constructor () {
    this.todo = []
    this.passes = []
    this.fails = []
    this.errors = []
  }

  test (comment, callback) {
    this.todo.push([`${caller()}::${comment}`, callback])
  }

  run () {
    this.todo.forEach(([comment, test]) => {
      try {
        test()
        this.passes.push(comment)
      } catch (e) {
        if (e instanceof assert.AssertionError) {
          this.fails.push(comment)
        } else {
          this.errors.push(comment)
        }
      }
    })
  }

  // [report]
  terse () {
    return this.cases()
      .map(([title, results]) => `${title}: ${results.length}`)
      .join(' ')
  }

  verbose () {
    let report = ''
    let prefix = ''
    for (const [title, results] of this.cases()) {
      report += `${prefix}${title}:`
      prefix = '\n'
      for (const r of results) {
        report += `${prefix}  ${r}`
      }
    }
    return report
  }

  cases () {
    return [
      ['passes', this.passes],
      ['fails', this.fails],
      ['errors', this.errors]]
  }
  // [/report]
}

export default new Hope()
