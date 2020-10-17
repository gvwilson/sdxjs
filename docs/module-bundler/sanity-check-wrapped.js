const wrapper = (module, require) => {
  const main = () => {
    console.log('in main')
  }

  module.exports = main
}
