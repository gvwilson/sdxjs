const FindAncestors = require('./find-ancestors')

const main = () => {
  const filename = process.argv[2]
  const className = process.argv[3]
  const finder = new FindAncestors()
  const ancestry = finder.find(filename, className)
  ancestry.forEach(({ filename, className }) => {
    console.log(`${className} in ${filename}`)
  })
}

main()
