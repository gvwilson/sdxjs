const fs = require('fs')
const htmlparser = require('htmlparser2')
const Expander = require('./expander')

const main = () => {
  const vars = readJSON(process.argv[2])
  const dom = readHtml(process.argv[3])
  const expander = new Expander(dom, vars)
  expander.walk()
  console.log(expander.result)
}

const readJSON = (filename) => {
  const text = fs.readFileSync(filename, 'utf-8')
  return JSON.parse(text)
}

const readHtml = (filename) => {
  const text = fs.readFileSync(filename, 'utf-8')
  return htmlparser.parseDOM(text)
}

main()
