/**
 * Enable dropdown menus.
 */
const enableDropdowns = () => {
  const allDropdowns = Array.from(document.querySelectorAll('div.dropdown'))

  // Handle clicks on dropdowns.
  allDropdowns.forEach(top => {
    const navTitle = top.querySelector('span.navtitle')
    const items = top.querySelector('div.dropdown-content')
    items.style.display = 'none'
    navTitle.addEventListener('click', event => {
      // Toggle visibility of this dropown.
      event.stopPropagation()
      items.style.display = (items.style.display === 'none') ? 'block' : 'none'
      // Make sure all other dropdowns aren't visible.
      allDropdowns.forEach(check => {
        if (check.id !== top.id) {
          check.querySelector('div.dropdown-content').style.display = 'none'
        }
      })
    })
  })

  // Clicking anywhere else in the document closes dropdowns.
  document.addEventListener('click', event => {
    allDropdowns.forEach(top => {
      top.querySelector('div.dropdown-content').style.display = 'none'
    })
  })
}

/**
 * Find and fix bibliographic citations.
 * @param {string} toRoot Path to root of volume.
 */
const fixBibCites = (toRoot) => {
  Array.from(document.querySelectorAll('cite'))
    .forEach(node => {
      const keys = node.innerHTML
            .trim()
            .split(',')
            .map(key => key.trim())
            .map(key => `<a href="${toRoot}/bibliography/#${key.toLowerCase()}">${key}</a>`)
            .join(', ')
      const cite = document.createElement('span')
      cite.innerHTML = `[${keys}]`
      node.parentNode.replaceChild(cite, node)
    })
}

/**
 * Fill in references to figures and tables.
 * @param {string} toRoot Path to root of volume.
 * @param {Object} numbering Lookup table.
 * @param {string} major Major element.
 * @param {string} minor Caption element.
 * @param {string} name Name to insert.
 */
const fixCaptions = (toRoot, numbering, major, minor, name) => {
  Array.from(document.querySelectorAll(major))
    .forEach(node => {
      const slug = node.getAttribute('id')
      const caption = node.querySelector(minor)
      if (caption) {
        caption.innerHTML = `${name} ${numbering[slug]}: ${caption.innerHTML}`
      }
    })
}

/**
 * Fill in cross-references.
 * @param {string} toRoot Path to root of volume.
 * @param {Object} numbering Numbering data.
 */
const fixCrossRefs = (toRoot, numbering) => {
  Array.from(document.querySelectorAll('span[x]'))
    .forEach(node => {
      const slug = node.getAttribute('x')
      const link = document.createElement('a')
      link.setAttribute('href', `${toRoot}/${slug}/`)
      link.innerHTML = numbering[slug].label
      node.parentNode.replaceChild(link, node)
    })
}

/**
 * Fill in references to figures and tables.
 * @param {string} toRoot Path to root of volume.
 * @param {Object} numbering Lookup table.
 * @param {string} key Attribute to look for.
 * @param {string} name Name to insert.
 */
const fixFloatRefs = (toRoot, numbering, key, name) => {
  const sel = `span[${key}]`
  Array.from(document.querySelectorAll(sel))
    .forEach(node => {
      const slug = node.getAttribute(key)
      const link = document.createElement('a')
      link.setAttribute('href', `#${slug}`)
      link.innerHTML = `${name} ${numbering[slug]}`
      node.parentNode.replaceChild(link, node)
    })
}

/**
 * Find and fix glossary references.
 * @param {string} toRoot Path to root of this volume.
 * @param {string} volume Name of this volume.
 */
const fixGlossaryRefs = (toRoot) => {
  Array.from(document.querySelectorAll('span[g]'))
    .forEach(node => {
      const key = node.getAttribute('g')
      const link = document.createElement('a')
      link.setAttribute('href', `${toRoot}/glossary/#${key}`)
      link.setAttribute('class', 'glossary-reference')
      link.innerHTML = node.innerHTML
      node.parentNode.replaceChild(link, node)
    })
}

/**
 * Make sure all <pre> elements have the right language class.
 */
const fixPreLanguageClass = () => {
  Array.from(document.querySelectorAll('code'))
    .filter(node => node.hasAttribute('class'))
    .filter(node => node.getAttribute('class').startsWith('language-'))
    .filter(node => node.parentNode.tagName.toUpperCase() === 'PRE')
    .forEach(node => node.parentNode.setAttribute('class', node.getAttribute('class')))
}

/**
 * Remove leading newlines from code inclusions.
 */
const fixPreNewlines = () => {
  Array.from(document.querySelectorAll('pre'))
    .forEach(node => {
      const code = node.querySelector('code')
      if (code) {
        const text = code.innerHTML
        if (text[0] == '\n') {
          code.innerHTML = text.slice(1)
        }
      }
    })
}

/**
 * Create table of contents.
 */
const fixToc = () => {
  const skipHeading = (node) => {
    return node.classList.contains('landing-subtitle') ||
      node.classList.contains('lede')
  }

  const headings = Array.from(document.querySelectorAll('h2'))
        .filter(node => !skipHeading(node))
  const toc = document.querySelector('ul.toc')
  if (headings.length === 0) {
    toc.parentNode.removeChild(toc)
  } else {
    toc.innerHTML = headings.map(heading => {
      const target = heading.getAttribute('id')
      const title = heading.innerHTML
      return `<li><a href="#${target}">${title}</a></li>`
    }).join('\n')
  }
}

/**
 * Perform all in-page fixes.
 */
const fixPage = () => {
  const toRoot = '..'
  enableDropdowns()
  fixBibCites(toRoot)
  fixCaptions(toRoot, FIGURES, 'figure', 'figcaption', 'Figure')
  fixCaptions(toRoot, TABLES, 'table', 'caption', 'Table')
  fixCrossRefs(toRoot, ENTRIES)
  fixFloatRefs(toRoot, FIGURES, 'f', 'Figure')
  fixFloatRefs(toRoot, TABLES, 't', 'Table')
  fixGlossaryRefs(toRoot)
  fixPreLanguageClass()
  fixPreNewlines()
  fixToc()
}
