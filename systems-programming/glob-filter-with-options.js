const glob = require('glob')

glob('**/*.*', {'ignore': '*~'}, (err, files) => {
  if (err) {
    console.log(err)
  } else {
    for (const filename of files) {
      console.log(filename)
    }
  }
})
