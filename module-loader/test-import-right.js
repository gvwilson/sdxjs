const need = require('./need-path')

const imported = need('imported-right.js')
imported('called from test-import-right.js')

const also_imported = need('imported-right.js')
also_imported('called from test-import-right.js')
