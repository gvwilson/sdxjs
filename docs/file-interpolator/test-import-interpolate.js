/* eslint-disable */
import need from './need-interpolate'
import imported from './import-interpolate.js'

const instance = new imported()
instance.topMethod('called from test-import-interpolate.js')
