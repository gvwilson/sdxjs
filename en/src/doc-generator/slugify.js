const slugify = (text) => {
  return encodeURIComponent(
    text.split(' ')[0]
      .replace(/.js$/, '')
      .trim()
      .toLowerCase()
      .replace(/[^ \w]/g, '')
      .replace(/\s+/g, '-')
  )
}

export default slugify
