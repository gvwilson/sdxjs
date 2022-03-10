import glob from 'glob'

const [srcDir, dstDir] = process.argv.slice(2)

glob(`${srcDir}/**/*.*`, { ignore: '*~' }, (err, files) => {
  if (err) {
    console.log(err)
  } else {
    for (const srcName of files) {
      const dstName = srcName.replace(srcDir, dstDir)
      console.log(srcName, dstName)
    }
  }
})
