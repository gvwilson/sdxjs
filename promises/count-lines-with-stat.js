import glob from 'glob-promise'
import fs from 'fs-extra-promise'

const main = (srcDir) => {
  glob(`${srcDir}/**/*.*`)
    .then(files => Promise.all(files.map(f => statPair(f))))
    .then(files => files.filter(pair => pair.stats.isFile()))
    .then(files => files.map(pair => pair.filename))
    .then(files => Promise.all(files.map(f => lineCount(f))))
    .then(counts => counts.forEach(
      c => console.log(`${c.lines}: ${c.name}`)))
    .catch(err => console.log(err.message))
}

const statPair = (filename) => {
  return new Promise((resolve, reject) => {
    fs.statAsync(filename)
      .then(stats => resolve({ filename, stats }))
      .catch(err => reject(err))
  })
}

const lineCount = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFileAsync(filename, { encoding: 'utf-8' })
      .then(data => resolve({
        name: filename,
        lines: data.split('\n').length - 1
      }))
      .catch(err => reject(err))
  })
}

const srcDir = process.argv[2]
main(srcDir)
