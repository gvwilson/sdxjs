/**
 * Enable dropdown menus.
 */
const enableDropdowns = () => {
  const dropdowns = Array.from(document.querySelectorAll('div.dropdown'))
  dropdowns.forEach(top => {
    const navTitle = top.querySelector('span.navtitle')
    const items = top.querySelector('div.dropdown-content')
    items.style.display = 'none'
    navTitle.addEventListener('click', event => {
      event.stopPropagation()
      items.style.display = (items.style.display === 'none') ? 'block' : 'none'
    })
  })

  document.addEventListener('click', event => {
    dropdowns.forEach(top => {
      const items = top.querySelector('div.dropdown-content')
      items.style.display = 'none'
    })
  })
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
 * Fill in cross-references.
 */
const fixCrossRefs = (toRoot, numbering) => {
  Array.from(document.querySelectorAll('x'))
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
 * Add numbers to figures and tables.
 * @param {Object} numbering Lookup table of chapter numbers.
 * @param {string} slug The slug of this page.
 * @param {string} tag Overall tag ('figure' or 'table').
 * @param {string} caption Caption tag ('figcaption' or 'caption' respectively).
 * @param {string} title Word to use as title ('Figure' or 'Table' respectively).
 * @returns {Object} IDs to elements of this kind within this page.
 */
const fixNumbers = (numbering, slug, tag, caption, title) => {
  const prefix = numbering[slug]
  const result = {}
  Array.from(document.querySelectorAll(tag))
    .filter(node => node.hasAttribute('id'))
    .forEach((node, i) => {
      const ident = node.getAttribute('id')
      const number = `${prefix}.${i + 1}`
      const cap = node.querySelector(caption)
      cap.innerHTML = `${title} ${number}: ${cap.innerHTML}`
      result[ident] = number
    })
  return result
}

/**
 * Fix cross-references to figures and tables.
 * @param {Object} refs IDs to elements within this page.
 * @param {string} tag Reference tag to look for ('f' or 't').
 * @param {string} cls Class to give reference ('figure-reference' or 'table-reference').
 * @param {string} title Word to use as title ('Figure' or 'Table' respectively).
 */
const fixFloatRefs = (refs, tag, cls, title) => {
  Array.from(document.querySelectorAll(tag))
    .forEach((node, i) => {
      const key = node.getAttribute('key')
      const link = document.createElement('a')
      link.setAttribute('href', `#${key}`)
      link.setAttribute('class', cls)
      link.innerHTML = `${title}&nbsp;${refs[key]}`
      node.parentNode.replaceChild(link, node)
    })
}

/**
 * Add the word 'FIXME" to fixmes.
 */
const fixFixmes = () => {
  Array.from(document.querySelectorAll('div.fixme'))
    .forEach(node => {
      const paragraph = node.querySelector('p')
      const word = document.createTextNode('FIXME: ')
      paragraph.insertBefore(word, paragraph.firstChild)
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
 * Find a meta value in the page's header.
 */
const getMeta = (key) => {
  return document
    .querySelector(`meta[name="${key}"]`)
    .getAttribute('content')
}

/**
 * Perform all in-page fixes.
 */
const fixPage = () => {
  const toRoot = getMeta('toRoot')
  const slug = getMeta('slug')
  enableDropdowns()
  buildToc()
  fixBibCites(toRoot)
  fixCrossRefs(toRoot, NUMBERING)
  const figureNumbers = fixNumbers(NUMBERING, slug, 'figure', 'figcaption', 'Figure')
  fixFloatRefs(figureNumbers, 'f', 'figure-reference', 'Figure')
  fixFixmes()
  fixGlossaryRefs(toRoot)
  fixPreBlocks()
  fixPreTitles()
  const tableNumbers = fixNumbers(NUMBERING, slug, 'table', 'caption', 'Table')
  fixFloatRefs(tableNumbers, 't', 'table-reference', 'Table')
}
