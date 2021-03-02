import minimist from 'minimist'
import glob from 'glob'
import hope from './hope.js'

const main = async (args) => {
  const options = parse(args)
  if (options.filenames.length === 0) {
    options.filenames = glob.sync(`${options.root}/**/test-*.js`)
  }
  for (const f of options.filenames) {
    await import(f)
  }
  hope.run()
  const result = (options.output === 'terse')
    ? hope.terse()
    : hope.verbose()
  console.log(result)
}

// [options]
const DEFAULTS = {
  filenames: [],
  root: '.',
  output: 'terse'
}

const parse = (args) => {
  const options = Object.assign({}, DEFAULTS)
  const argv = minimist(args)
  for (const key in argv) {
    switch (key) {
      case 'd' :
        options.root = argv[key]
        break
      case 'v' :
        options.output = 'verbose'
        break
      case '_':
        options.filenames = argv[key]
        break
      default :
        console.error(`unrecognized option ${key}`)
        break
    }
  }
  return options
}
// [/options]

main(process.argv.slice(2))
