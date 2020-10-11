everything = {
'simple/other.js': ((module) => {
const other = () => {
  return 'message from other'
}

module.exports = other

return module
})({})
}
