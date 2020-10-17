const fs = require('fs')
const parse5 = require('parse5')
const Expander = require('./expander')

const main = () => {
  const vars = readJSON(process.argv[2])
  const doc = readHtml(process.argv[3]).childNodes[0]
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
  return parse5.parse(text)
}

main()
