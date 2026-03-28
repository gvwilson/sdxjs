const { loadPlugin } = require('./main')

const printMessage = () => {
  console.log('running plugin')
}

loadPlugin(printMessage)
