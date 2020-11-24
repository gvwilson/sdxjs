export default (config) => JSON.stringify(config)
  .replace(/"/g, '')
  .replace(/,/g, ' ')
