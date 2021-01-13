#!/usr/bin/env node

import fs from 'fs'

const TITLES = [
  'nRows',
  'nCols',
  'filterPerSelect',
  'rowFilterTime',
  'rowSelectTime',
  'colFilterTime',
  'colSelectTime'
]

const main = () => {
  console.log(TITLES.join('|'))
  console.log(TITLES.map(s => '---:').join('|'))
  process.argv.slice(2).forEach(filename => {
    const lookup = {}
    fs.readFileSync(filename, 'utf-8')
      .split('\n')
      .map(line => line.split(':'))
      .forEach(([name, value]) => {
        if (TITLES.includes(name)) {
          lookup[name] = parseFloat(value)
        }
      })
    const row = TITLES.map(name => lookup[name]).join('|')
    console.log(row)
  })
}

main()
