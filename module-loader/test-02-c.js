const need = require('./need-02')

const imported = need('import-02-a.js')
imported('called from test-02-c.js')

const imported_again = need('import-02-a.js')
imported_again('called again from test-02-c.js')
