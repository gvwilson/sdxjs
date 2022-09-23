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
  // build rows
  const header = ['value']
  const lines = [':---']
  const rows = {}
  TITLES.forEach(title => {
    rows[title] = [title]
  })
  process.argv.slice(2).forEach(filename => {
    header.push(filename.replace('table-performance-', '').replace('.out', ''))
    lines.push('---:')
    fs.readFileSync(filename, 'utf-8')
      .split('\n')
      .map(line => line.split(':'))
      .forEach(([name, value]) => {
	name = name.trim()
	if (name in rows) {
	  rows[name].push(parseFloat(value))
	}
      })
  })
  console.log(header.join('|'))
  console.log(lines.join('|'))
  TITLES.forEach(title => {
    console.log(rows[title].join('|'))
  })
}

main()
