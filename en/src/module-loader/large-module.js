import need from './need'

const small = need('small-module.js')

const large = (caller) => {
  console.log(`large from ${caller}`)
  small.publicFunction(`${caller} to large`)
}

export default large
