import htmlparser2 from 'htmlparser2'

import select from './simple-selectors.js'

// [tests]
const HTML = `<main>
  <p>text of first p</p>
  <p id="id-01">text of p#id-01</p>
  <p id="id-02">text of p#id-02</p>
  <p class="class-03">text of p.class-03</p>
  <div>
    <p>text of div / p</p>
    <p id="id-04">text of div / p#id-04</p>
    <p class="class-05">text of div / p.class-05</p>
    <p class="class-06">should not be found</p>
  </div>
  <div id="id-07">
    <p>text of div#id-07 / p</p>
    <p class="class-06">text of div#id-07 / p.class-06</p>
  </div>
</main>`
// [/tests]

// [getText]
const getText = (node) => {
  if (!node) {
    return 'MISSING NODE'
  }
  if (!('children' in node)) {
    return 'MISSING CHILDREN'
  }
  if (node.children.length !== 1) {
    return 'WRONG NUMBER OF CHILDREN'
  }
  if (node.children[0].type !== 'text') {
    return 'NOT TEXT'
  }
  return node.children[0].data
}
// [/getText]

// [main]
const main = () => {
  const doc = htmlparser2.parseDOM(HTML)[0]
  const tests = [
    ['p', 'text of first p'],
    ['p#id-01', 'text of p#id-01'],
    ['p#id-02', 'text of p#id-02'],
    ['p.class-03', 'text of p.class-03'],
    ['div p', 'text of div / p'],
    ['div p#id-04', 'text of div / p#id-04'],
    ['div p.class-05', 'text of div / p.class-05'],
    ['div#id-07 p', 'text of div#id-07 / p'],
    ['div#id-07 p.class-06', 'text of div#id-07 / p.class-06']
  ]
  tests.forEach(([selector, expected]) => {
    const node = select(doc, selector)
    const actual = getText(node)
    const result = (actual === expected) ? 'pass' : 'fail'
    console.log(`"${selector}": ${result}`)
  })
}

main()
// [/main]
