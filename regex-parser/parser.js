const assert = require('assert')

const tokenize = require('./tokenizer')

const parse = (text) => {
  const allTokens = tokenize(text)
  const output = []
  const stack = []
  for (let token of allTokens) {
    if (token.token === 'Lit') {
      output.push(token)
    }

    else if (token.token === 'Start') {
      assert.equal(token.loc, 0,
                   `Start token after start (location ${token.loc})`)
      output.push(token)
    }

    else if (token.token === 'End') {
      assert.equal(token.loc, text.length - 1,
                   `End token before end (location ${token.loc})`)
      output.push(token)
    }

    else if (token.token === 'Any') {
    }

    else if (token.token === 'Alt') {
    }

    else if (token.token === 'GroupStart') {
    }

    else if (token.token === 'GroupEnd') {
    }

    else {
      assert(false,
             `Unknown token ${JSON.stringify(token)}`)
    }
  }
  return output
}

module.exports = parse
