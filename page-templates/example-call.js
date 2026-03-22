const variables = {
  names: ['Johnson', 'Vaughan', 'Jackson']
}
const dom = readHtml('template.html') // eslint-disable-line
const expander = new Expander(dom, variables) // eslint-disable-line
expander.walk()
console.log(expander.result)
