import fs from 'fs-extra-promise'
import yaml from 'js-yaml'

const test = async () => {
  const raw = await fs.readFileAsync('config.yml', 'utf-8')
  console.log('inside test, raw text', raw)
  const cooked = yaml.safeLoad(raw)
  console.log('inside test, cooked configuration', cooked)
  return cooked
}

const result = test()
console.log('outside test, result is', result.constructor.name)
result.then(something => console.log('outside test we have', something))
