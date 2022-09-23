const makeAppender = (toAppend) => {
  const appenderFunction = (text) => {
    return text + ` + ${toAppend}`
  }
  return appenderFunction
}

const firstAppender = makeAppender('first')
const extended = firstAppender('message')
console.log(extended)
