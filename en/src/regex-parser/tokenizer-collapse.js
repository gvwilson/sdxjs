const SIMPLE = {
  '*': 'Any',
  '|': 'Alt',
  '(': 'GroupStart',
  ')': 'GroupEnd'
}

const tokenize = (text) => {
  const result = []
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i]
    if (c in SIMPLE) {
      result.push({ kind: SIMPLE[c], loc: i })
    } else if (c === '^') {
      if (i === 0) {
        result.push({ kind: 'Start', loc: i })
      } else {
        combineOrPush(result, c, i)
      }
    } else if (c === '$') {
      if (i === (text.length - 1)) {
        result.push({ kind: 'End', loc: i })
      } else {
        combineOrPush(result, c, i)
      }
    } else {
      combineOrPush(result, c, i)
    }
  }

  return result
}

// [combine]
const combineOrPush = (soFar, character, location) => {
  const topIndex = soFar.length - 1
  if ((soFar.length === 0) || (soFar[topIndex].token !== 'Lit')) {
    soFar.push({ kind: 'Lit', value: character, loc: location })
  } else {
    soFar[topIndex].value += character
  }
}
// [/combine]

export default tokenize
