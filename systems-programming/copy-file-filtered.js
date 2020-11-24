import glob from 'glob'
import fs from 'fs-extra'
import path from 'path'

const [srcRoot, dstRoot] = process.argv.slice(2)

glob(`${srcRoot}/**/*.*`, { ignore: '*~' }, (err, files) => {
  if (err) {
    console.log(err)
  } else {
    for (const srcName of files) {
      fs.stat(srcName, (err, stats) => {
        if (err) {
          console.error(err)
        } else if (stats.isFile()) {
          const dstName = srcName.replace(srcRoot, dstRoot)
          const dstDir = path.dirname(dstName)
          fs.ensureDir(dstDir, (err) => {
            if (err) {
              console.error(err)
            } else {
              fs.copy(srcName, dstName, (err) => {
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
