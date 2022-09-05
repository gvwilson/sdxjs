const fillIn = (filename, comments, definitions) => {
  const map = definitions.reduce((map, def) => {
    map.set(def.start, { name: def.name, type: def.type })
    return map
  }, new Map())

  const filled = comments.map(comment => {
    let text = comment.stripped
    const target = comment.end + 1
    if (map.has(target)) {
      const def = map.get(target)
      const level = def.type === 'MethodDefinition'
        ? '###'
        : '##'
      const title = `${level} ${def.name}\n`
      text = title + text
    }
    return text
  })

  return `# ${filename}\n\n` + filled.join('\n\n')
}

export default fillIn
