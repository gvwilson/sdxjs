const wrapper = (module, require) => { // eslint-disable-line
  const main = () => {
    console.log('in main')
  }

  module.exports = main
}
