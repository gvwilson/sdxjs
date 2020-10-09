const slugify = (text) => {
  return encodeURIComponent(
    text.trim()
      .toLowerCase()
      .replace(/[^ \w]/g, '')
      .replace(/\s+/g, '-')
  )
}

module.exports = slugify
