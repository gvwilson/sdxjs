const wrapper = (module, require) => {
  const main = () => {
    console.log('in main')
  }

  module.exports = main
}

const _require = (name) => null
const temp = {}
wrapper(temp, _require)
temp.exports()
