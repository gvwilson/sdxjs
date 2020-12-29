#!/usr/bin/env node

import parse from 'csv-parse/lib/sync.js'
import fs from 'fs'

const OPTIONS = {
  columns: true
}

const NUMBERS = ['original', 'first']

const main = () => {
  const csvFile = process.argv[2]
  const text = fs.readFileSync(csvFile, 'utf-8')
  const data = parse(text, OPTIONS)
  convert(data)
  report(data)
}

const convert = (data) => {
  data.forEach(record => {
    NUMBERS.forEach(col => {
      record[col] = record[col] ? Number(record[col]) : 0
    })
  })
}

const report = (data) => {
  const changes = { num: 0, percent: 0, total: 0 }
  console.log('filename:original:first:change')
  console.log('--------:--------:-----:------')
  data.forEach(record => {
    const first = (record.first !== 0) ? record.first : ''
    let percent = ''
    if (record.first !== 0) {
      const change = 100 * record.first / record.original
      percent = `${change}`.split('.')[0] + '%'
      if (record.filename === 'total') {
        changes.total = record.original
      } else {
        changes.num += 1
        changes.percent += change
      }
    }
    console.log(`${record.filename}:${record.original}:${first}:${percent}`)
  })
  const average = changes.percent / changes.num
  const expected = changes.total * average / 100
  const report = `${expected}`.split('.')[0]
  console.log(`expected:${report}`)
}

main()
