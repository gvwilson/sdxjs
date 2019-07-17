const glob = require('glob')
const fs = require('fs-extra')
const path = require('path')

const [srcRoot, destRoot] = process.argv.slice(2)

glob(`${srcRoot}/**/*.*`, {'ignore': '*~'}, (err, files) => {
  if (err) {
    console.log(err)
  } else {
    for (const srcName of files) {
      fs.stat(srcName, (err, stats) => {
        if (err) {
          console.error(err)
        } else if (stats.isFile()) {
          const destName = srcName.replace(srcRoot, destRoot)
          const destDir = path.dirname(destName)
          fs.ensureDir(destDir, (err) => {
            if (err) {
              console.error(err)
            } else {
              fs.copy(srcName, destName, (err) => {
                if (err) {
                  console.error(err)
                }
              })
            }
          })
        }
      })
    }
  }
})
