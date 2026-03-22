const PLUGINS = []

const plugin = require('./plugin')

const main = () => {
  PLUGINS.forEach(p => p())
}

const loadPlugin = (plugin) => {
  PLUGINS.push(plugin)
}

module.exports = {
  main,
  loadPlugin
}
