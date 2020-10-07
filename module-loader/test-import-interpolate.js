const need = require('./need-interpolate')
const imported = need('./import-interpolate.js')
const instance = new imported()
instance.topMethod('called from test-import-interpolate.js')
