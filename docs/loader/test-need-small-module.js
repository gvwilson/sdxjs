import need from './need.js'

const small = need('small-module.js')
console.log(`small.publicValue is ${small.publicValue}`)
console.log(`small.privateValue is ${small.privateValue}`)
console.log(small.publicFunction('main'))
