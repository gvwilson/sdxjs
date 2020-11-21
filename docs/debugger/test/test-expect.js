const path = require('path')

// <setup>
const Expect = require('../expect')
const VM = require('../vm-interactive')
const Debugger = require('../debugger-test')
const readSource = require('../read-source')

const setup = (filename) => {
  const lines = readSource(path.join(__dirname, filename))
  const dbg = new Debugger()
  const vm = new VM(lines, dbg)
  return new Expect(dbg, () => vm.run())
}
// </setup>

// <tests>
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
// </tests>
