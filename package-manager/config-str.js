module.exports = (config) => JSON.stringify(config).replace(/"/g, '').replace(/,/g, ' ')
