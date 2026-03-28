import need from './need-path.js'

const imported = need('imported-right.js')
imported('called from test-import-right.js')

const alsoImported = need('imported-right.js')
alsoImported('called from test-import-right.js')
