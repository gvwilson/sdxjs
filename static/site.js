/**
 * Find the path to the website root in the page's metadata.
 */
const getPathToRoot = () => {
  return document
    .querySelector('meta[name="toRoot"]')
    .getAttribute('content')
}

/**
 * Find and fix bibliographic citations.
 * @param {string} toRoot Path to root of website.
 */
const fixBibCites = (toRoot) => {
  Array.from(document.querySelectorAll('cite'))
    .forEach(node => {
      const keys = node.innerHTML
            .trim()
            .split(',')
            .map(key => key.trim())
            .map(key => `<a href="${toRoot}/bib/#${key}">${key}</a>`)
            .join(', ')
      const cite = document.createElement('span')
      cite.innerHTML = `[${keys}]`
      node.parentNode.replaceChild(cite, node)
    })
}

/**
 * Find and fix glossary references.
 * @param {string} toRoot Path to root of website.
 */
const fixGlossaryRefs = (toRoot) => {
  Array.from(document.querySelectorAll('g'))
    .forEach(node => {
      const key = node.getAttribute('key')
      const link = document.createElement('a')
      link.setAttribute('href', `${toRoot}/gloss/#${key}`)
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
    div.innerHTML = headings.filter(node => node.getAttribute('class') !== 'lede')
      .map((node, i) => {
        const br = (i > 0) ? '<br/>' : ''
        const link = `<a href="#${node.getAttribute('id')}">${node.innerHTML}</a>`
        return `${br}<span class="nowrap">${link}</span>`
      }).join('\n')
  }
}

/**
 * Fill in cross-references.
 */
const fixCrossRefs = (toRoot, numbering) => {
  Array.from(document.querySelectorAll('xref'))
    .forEach(node => {
      const slug = node.getAttribute('key')
      const content = node.innerHTML

      const link = document.createElement('a')
      const path = (slug === '/') ? '' : `${slug}/`
      link.setAttribute('href', `${toRoot}/${path}`)
      link.setAttribute('number', numbering[slug])

      if (content) {
        link.innerHTML = content
      }
      else if (numbering[slug] < 'A') {
        link.innerHTML = `Chapter ${numbering[slug]}`
      }
      else {
        link.innerHTML = `Appendix ${numbering[slug]}`
      }

      node.parentNode.replaceChild(link, node)
    })
}

/**
 * Add links to source files.
 */
const fixPreTitles = () => {
  Array.from(document.querySelectorAll('pre[title]'))
    .forEach(node => {
      const filename = node.getAttribute('title')
      const div = document.createElement('div')
      div.setAttribute('class', 'file-link')
      div.innerHTML = `<a href="${filename}">${filename}</a>`
      node.appendChild(div)
    })
}

/**
 * Perform all in-page fixes.
 */
const fixPage = () => {
  const toRoot = getPathToRoot()
  const xhr = new XMLHttpRequest()
  xhr.open('GET', `${toRoot}/numbering.js`, true)
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      const numbering = JSON.parse(xhr.responseText)
      fixBibCites(toRoot)
      fixGlossaryRefs(toRoot)
      fixPreBlocks()
      fixCrossRefs(toRoot, numbering)
      fixPreTitles()
      buildToc()
    }
    else {
      console.error(xhr.statusText)
    }
  }
  xhr.onerror = function (e) {
    console.error(xhr.statusText)
  }
  xhr.send(null)
}
