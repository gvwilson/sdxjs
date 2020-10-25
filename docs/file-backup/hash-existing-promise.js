const fs = require('fs-extra-promise')
const glob = require('glob-promise')
const crypto = require('crypto')

const statPath = (path) => {
  return new Promise((resolve, reject) => {
    fs.statAsync(path)
      .then(stat => resolve([path, stat]))
      .catch(err => reject(err))
  })
}

const readPath = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFileAsync(path, 'utf-8')
      .then(content => resolve([path, content]))
      .catch(err => reject(err))
  })
}

const hashPath = (path, content) => {
  const hasher = crypto.createHash('sha1').setEncoding('hex')
  hasher.write(content)
  hasher.end()
  return [path, hasher.read()]
}

const hashExisting = (rootDir) => {
  const pattern = `${rootDir}/**/*`
  const options = {}
  return new Promise((resolve, reject) => {
    glob(pattern, options)
      .then(matches => Promise.all(
        matches.map(path => statPath(path))))
      .then(pairs => pairs.filter(
        ([path, stat]) => stat.isFile()))
      .then(pairs => Promise.all(
        pairs.map(([path, stat]) => readPath(path))))
      .then(pairs => Promise.all(
        pairs.map(([path, content]) => hashPath(path, content))))
      .then(pairs => resolve(pairs))
      .catch(err => reject(err))
  })
}

module.exports = hashExisting
