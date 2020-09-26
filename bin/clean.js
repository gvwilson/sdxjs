#!/usr/bin/env node

'use strict'

const rimraf = require('rimraf')

process.argv.slice(2).forEach(pattern => rimraf.sync(pattern))
