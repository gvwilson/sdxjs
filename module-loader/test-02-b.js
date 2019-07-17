const need = require('./need-02')

const imported = need('import-02-a.js')
imported('called from test-02-b.js')

const also_imported = need('import-02-b.js')
also_imported('called from test-02-b.js')
