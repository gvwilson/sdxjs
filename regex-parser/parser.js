import assert from 'assert'

import tokenize from './tokenizer.js'

const parse = (text) => {
  const result = []
  const allTokens = tokenize(text)
  for (let i = 0; i < allTokens.length; i += 1) {
    const token = allTokens[i]
    const last = i === allTokens.length - 1
    handle(result, token, last)
  }
  return compress(result)
}

// [skip]
// [handle]
const handle = (result, token, last) => {
  if (token.kind === 'Lit') {
    result.push(token)
  } else if (token.kind === 'Start') {
    assert(result.length === 0,
      'Should not have start token after other tokens')
    result.push(token)
  } else if (token.kind === 'End') {
    assert(last,
      'Should not have end token before other tokens')
    result.push(token)
  } else if (token.kind === 'GroupStart') {
    result.push(token)
  } else if (token.kind === 'GroupEnd') {
    result.push(groupEnd(result, token))
  } else if (token.kind === 'Any') {
    assert(result.length > 0,
      `No operand for '*' (location ${token.loc})`)
    token.child = result.pop()
    result.push(token)
  } else if (token.kind === 'Alt') {
    assert(result.length > 0,
      `No operand for '*' (location ${token.loc})`)
    token.left = result.pop()
    token.right = null
    result.push(token)
  } else {
    assert(false, 'UNIMPLEMENTED')
  }
}
// [/handle]

// [groupend]
const groupEnd = (result, token) => {
  const group = {
    kind: 'Group',
    loc: null,
    end: token.loc,
    children: []
  }
  while (true) {
    assert(result.length > 0,
           `Unmatched end parenthesis (location ${token.loc})`)
    const child = result.pop()
    if (child.kind === 'GroupStart') {
      group.loc = child.loc
      break
    }
    group.children.unshift(child)
  }
  return group
}
// [/groupend]

// [compress]
const compress = (raw) => {
  const cooked = []
  while (raw.length > 0) {
    const token = raw.pop()
    if (token.kind === 'Alt') {
      assert(cooked.length > 0,
             `No right operand for alt (location ${token.loc})`)
      token.right = cooked.shift()
    }
    cooked.unshift(token)
  }
  return cooked
}
// [/compress]
// [/skip]

export default parse
