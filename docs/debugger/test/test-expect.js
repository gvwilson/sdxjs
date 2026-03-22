import path from 'path'

// [setup]
import Expect from '../expect.js'
import VM from '../vm-interactive.js'
import Debugger from '../debugger-test.js'
import readSource from '../read-source.js'

const setup = (filename) => {
  const lines = readSource(path.join('debugger/test', filename))
  const dbg = new Debugger()
  const vm = new VM(lines, dbg)
  return new Expect(dbg, () => vm.run())
}
// [/setup]

// [tests]
describe('interactive debugger', () => {
  it('runs and prints', (done) => {
    setup('print-0.json')
      .get('[1 ?clnprsvx] ')
      .send('r')
      .get('>> 0')
      .run()
    done()
  })

  it('breaks and resumes', (done) => {
    setup('print-3.json')
      .get('[1 ?clnprsvx] ')
      .send('s 3')
      .get('[1 ?clnprsvx] ')
      .send('r')
      .get('>> 0')
      .get('>> 1')
      .get('[3 ?clnprsvx] ')
      .send('x')
      .run()
    done()
  })
})
// [/tests]
