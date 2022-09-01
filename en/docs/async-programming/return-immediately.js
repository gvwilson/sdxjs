async function returnImmediately () {
  try {
    return Promise.reject(new Error('deliberate'))
  } catch (err) {
    console.log('caught exception')
  }
}

returnImmediately()
