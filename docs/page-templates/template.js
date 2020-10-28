const fs = require('fs')
const htmlparser2 = require('htmlparser2')

const Expander = require('./expander')

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
