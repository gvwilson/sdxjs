import FindAncestors from './find-ancestors.js'

class FindMethods extends FindAncestors {
  find (dirname, filename, className) {
    const classes = super.find(dirname, filename, className)
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

export default FindMethods
