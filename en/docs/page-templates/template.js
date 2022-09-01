import fs from 'fs'
import htmlparser2 from 'htmlparser2'

import Expander from './expander.js'

const main = () => {
  const vars = readJSON(process.argv[2])
  const doc = readHtml(process.argv[3])
  const expander = new Expander(doc, vars)
  expander.walk()
  console.log(expander.getResult())
}

const readJSON = (filename) => {
  const text = fs.readFileSync(filename, 'utf-8')
  return JSON.parse(text)
}

const readHtml = (filename) => {
  const text = fs.readFileSync(filename, 'utf-8')
  return htmlparser2.parseDOM(text)[0]
}

main()
