const got = require('got')

const getter = async (url, word) => {
  const { body } = await got.post(url, {
    json: { key: word },
    responseType: 'json'
  })
  console.log(body)
}

const url = process.argv[2]
const word = process.argv[3]

getter(url, word)
