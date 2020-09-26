const glob = require('glob-promise')
const fs = require('fs-extra-promise')

const main = (srcDir) => {
  glob(`${srcDir}/**/*.js`)
    .then(files => Promise.all(files.map(f => statPair(f))))
    .then(files => files.filter(pair => pair.stats.isFile()))
    .then(files => files.map(pair => pair.filename))
    .then(files => Promise.all(files.map(f => lineCount(f))))
    .then(counts => makeHistogram(counts))
    .then(histogram => display(histogram))
    .catch(err => console.log(err.message))
}

const statPair = (filename) => {
  return new Promise((resolve, reject) => {
    fs.statAsync(filename)
      .then(stats => resolve({filename, stats}))
      .catch(err => reject(err))
  })
}

const lineCount = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFileAsync(filename, {encoding: 'utf-8'})
      .then(data => resolve(data.split('\n').length-1))
      .catch(err => reject(err))
  })
}

const makeHistogram = (lengths) => {
  const largest = Math.max(...lengths)
  const bins = new Array(largest + 1).fill(0)
  lengths.forEach(n => { bins[n] += 1 })
  return bins
}

const display = (bins) => {
  bins.forEach((val, i) => console.log(`${i} ${val}`))
}

const srcDir = process.argv[2]
main(srcDir)
