import glob from 'glob-promise'
import fs from 'fs-extra-promise'

const main = (srcDir) => {
  glob(`${srcDir}/**/*.*`)
    .then(files => Promise.all(files.map(f => lineCount(f))))
    .then(counts => counts.forEach(c => console.log(c)))
    .catch(err => console.log(err.message))
}

const lineCount = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFileAsync(filename, { encoding: 'utf-8' })
      .then(data => resolve(data.split('\n').length - 1))
      .catch(err => reject(err))
  })
}

const srcDir = process.argv[2]
main(srcDir)
