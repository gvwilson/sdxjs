const createAppender = (suffix) => {
  const appender = (text) => {
    return text + suffix
  }
  return appender
}

const exampleFunction = createAppender(' and that')
console.log(exampleFunction('this'))
console.log('suffix is', suffix)
