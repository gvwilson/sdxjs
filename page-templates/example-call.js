const variables = {
  names: ['Johnson', 'Vaughan', 'Jackson']
}
const dom = readHtml('template.html')
const expander = new Expander(dom, variables)
expander.walk()
console.log(expander.result)
