const wrapper = (module, require) => {
  const main = () => {
    console.log('in main')
  }

  module.exports = main
}

const need = (name) => null
const temp = {}
wrapper(temp, need)
temp.exports()
