const oops = new Promise((resolve, reject) => reject(new Error('failure')))
oops.catch(err => console.log(err.message))
oops.catch(err => console.log(err.message))
