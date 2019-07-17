const variables = {
  "names": ["Johnson", "Vaughan", "Jackson"]
}
const dom = readHtml('template.html')
const expander = new Expander(dom, vars)
expander.walk()
console.log(expander.result)
