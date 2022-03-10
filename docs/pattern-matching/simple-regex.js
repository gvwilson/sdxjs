// [match]
const match = (pattern, text) => {
  // '^' at start of pattern matches start of text.
  if (pattern[0] === '^') {
    return matchHere(pattern, 1, text, 0)
  }

  // Try all possible starting points for pattern.
  let iText = 0
  do {
    if (matchHere(pattern, 0, text, iText)) {
      return true
    }
    iText += 1
  } while (iText < text.length)

  // Nothing worked.
  return false
}
// [/match]

// [matchHere]
const matchHere = (pattern, iPattern, text, iText) => {
  // There is no more pattern to match.
  if (iPattern === pattern.length) {
    return true
  }

  // '$' at end of pattern matches end of text.
  if ((iPattern === (pattern.length - 1)) &&
      (pattern[iPattern] === '$') &&
      (iText === text.length)) {
    return true
  }

  // '*' following current character means match many.
  if (((pattern.length - iPattern) > 1) &&
      (pattern[iPattern + 1] === '*')) {
    while ((iText < text.length) && (text[iText] === pattern[iPattern])) {
      iText += 1
    }
    return matchHere(pattern, iPattern + 2, text, iText)
  }

  // Match a single character.
  if ((pattern[iPattern] === '.') ||
      (pattern[iPattern] === text[iText])) {
    return matchHere(pattern, iPattern + 1, text, iText + 1)
  }

  // Nothing worked.
  return false
}
// [/matchHere]

// [tests]
const main = () => {
  const tests = [
    ['a', 'a', true],
    ['b', 'a', false],
    ['a', 'ab', true],
    ['b', 'ab', true],
    ['ab', 'ba', false],
    ['^a', 'ab', true],
    ['^b', 'ab', false],
    ['a$', 'ab', false],
    ['a$', 'ba', true],
    ['a*', '', true],
    ['a*', 'baac', true],
    ['ab*c', 'ac', true],
    ['ab*c', 'abc', true],
    ['ab*c', 'abbbc', true],
    ['ab*c', 'abxc', false]
  ]
  tests.forEach(([regexp, text, expected]) => {
    const actual = match(regexp, text)
    const result = (actual === expected) ? 'pass' : 'fail'
    console.log(`"${regexp}" X "${text}": ${result}`)
  })
}

main()
// [/tests]
