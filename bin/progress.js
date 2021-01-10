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
  const totals = { num: 0, original: 0, first: 0 }
  console.log('filename:original:first:change')
  console.log('--------:--------:-----:------')
  data.forEach(record => {
    totals.num += 1
    totals.original += record.original
    totals.first += record.first
    const percent = `${100 * record.first / record.original}`.split('.')[0]
    console.log(`${record.filename}:${record.original}:${record.first}:${percent}%`)
  })
}

main()
