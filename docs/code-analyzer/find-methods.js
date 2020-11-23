const FindAncestors = require('./find-ancestors')

class FindMethods extends FindAncestors {
  find (filename, className) {
    const classes = super.find(filename, className)
    classes.forEach(record => {
      record.methods = this.findMethods(record.classDef)
    })
    return classes
  }

  findMethods (classDef) {
    return classDef.body.body
      .filter(item => item.type === 'MethodDefinition')
      .map(item => {
        if (item.kind === 'constructor') {
          return 'constructor'
        } else if (item.kind === 'method') {
          return item.key.name
        } else {
          return null
        }
      })
      .filter(item => item !== null)
  }
}

module.exports = FindMethods
