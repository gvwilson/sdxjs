const need = require('./need-path')
const imported = need('imported-left.js')
imported('called from test-import-left.js')
