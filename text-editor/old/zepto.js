#!/usr/bin/env node

const need = require('../module-loader/need-03')
const Editor = need('./editor.js')

const args = process.argv.slice(2)
const editor = new Editor()
editor.init(args[0])
