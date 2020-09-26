const glob = require('glob')

const [srcDir, destDir] = process.argv.slice(2)

glob(`${srcDir}/**/*.*`, {ignore: '*~'}, (err, files) => {
  if (err) {
    console.log(err)
  } else {
    for (const srcName of files) {
      const destName = srcName.replace(srcDir, destDir)
      console.log(srcName, destName)
    }
  }
})
