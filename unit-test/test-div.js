const assert = require('assert')
const hope = require('./hope')

hope.test('Quotient of 1 and 0', () => assert((1 / 0) === 0))
