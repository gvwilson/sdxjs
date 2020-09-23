#!/usr/bin/env node

'use strict'

import rimraf from 'rimraf'

process.argv.slice(2).forEach(pattern => rimraf.sync(pattern))
