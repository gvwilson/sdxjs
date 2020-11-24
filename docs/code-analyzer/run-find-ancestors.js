import FindAncestors from './find-ancestors.js'

const main = () => {
  const dirname = process.argv[2]
  const filename = process.argv[3]
  const className = process.argv[4]
  const finder = new FindAncestors()
  const ancestry = finder.find(dirname, filename, className)
  ancestry.forEach(({ filename, className }) => {
    console.log(`${className} in ${filename}`)
  })
}

main()
