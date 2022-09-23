// eslint-disable
import need from './need-interpolate.js'
const imported = need('./import-interpolate.js')

const instance = new imported()
instance.topMethod('called from test-import-interpolate.js')
