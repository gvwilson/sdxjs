import fs from 'fs'

const listContents = (err, files) => {
  console.log('running callback')
  if (err) {
    console.error(err)
  } else {
    for (const name of files) {
      console.log(name)
    }
  }
}

const srcDir = process.argv[2]
fs.readdir(srcDir, listContents)
console.log('last line of program')
