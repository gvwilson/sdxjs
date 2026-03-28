new Promise((resolve, reject) => reject(new Error('failure')))
  .catch(err => console.log(err))
  .then(err => console.log(err))
