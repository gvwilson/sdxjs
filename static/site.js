/**
 * Find the path to the website root in the page's metadata.
 */
const getRelativeRoot = () => {
  return document
    .querySelector('meta[name="relativeRoot"]')
    .getAttribute('content')
}

/**
 * Find and fix bibliographic citations.
 * @param {string} relativeRoot Path to root of website.
 */
const fixBibCites = (relativeRoot) => {
  Array.from(document.querySelectorAll('cite'))
    .forEach(node => {
      const keys = node.innerHTML
            .trim()
            .split(',')
            .map(key => key.trim())
            .map(key => `<a href="${relativeRoot}/bib/#${key}">${key}</a>`)
            .join(', ')
      const cite = document.createElement('span')
      cite.innerHTML = `[${keys}]`
      node.parentNode.replaceChild(cite, node)
    })
}

/**
 * Find and fix glossary references.
 * @param {string} relativeRoot Path to root of website.
 */
const fixGlossaryRefs = (relativeRoot) => {
  Array.from(document.querySelectorAll('g'))
    .forEach(node => {
      const key = node.getAttribute('key')
      const link = document.createElement('a')
      link.setAttribute('href', `${relativeRoot}/gloss/#${key}`)
      link.setAttribute('class', 'glossary-reference')
      link.innerHTML = node.innerHTML
      node.parentNode.replaceChild(link, node)
    })
}

/**
 * Change styling of 'pre' blocks based on the 'code' blocks they contain.
 */
const fixPreBlocks = () => {
  Array.from(document.querySelectorAll('code'))
    .filter(node => node.hasAttribute('class'))
    .filter(node => node.getAttribute('class').startsWith('language-'))
    .filter(node => node.parentNode.tagName.toUpperCase() === 'PRE')
    .forEach(node => node.parentNode.setAttribute('class', node.getAttribute('class')))
}

/**
 * Build table of contents for this page.
 */
const buildToc = () => {
  const div = document.querySelector('div#Sections')
  const headings = Array.from(document.querySelectorAll('h2'))
  if (headings.length === 0) {
    const parent = div.parentNode
    parent.removeChild(div)
    parent.classList.add('disabled')
  }
  else {
    div.innerHTML = headings.map((node, i) => {
      const br = (i > 0) ? '<br/>' : ''
      const link = `<a href="#${node.getAttribute('id')}">${node.innerHTML}</a>`
      return `${br}<span class="nowrap">${link}</span>`
    }).join('\n')
  }
}

/**
 * Perform all in-page fixes.
 */
const fixPage = () => {
  const relativeRoot = getRelativeRoot()
  fixBibCites(relativeRoot)
  fixGlossaryRefs(relativeRoot)
  fixPreBlocks()
  buildToc()
}
