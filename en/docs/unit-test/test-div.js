import assert from 'assert'
import hope from './hope.js'

hope.test('Quotient of 1 and 0', () => assert((1 / 0) === 0))
