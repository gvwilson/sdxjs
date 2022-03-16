import glob from 'glob'

glob('**/*.*', (err, files) => {
  if (err) {
    console.log(err)
  } else {
    files = files.filter(f => !f.endsWith('~'))
    for (const filename of files) {
      console.log(filename)
    }
  }
})
