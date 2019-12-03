const fs = require('fs')
const path = require('path')

const { PLUGIN_ROOT } = require('./constants')

/**
 * @method createDirectory
 * @param  {String} dir
 * @return String
 */
const createDirectory = dir => {
  const pwd = path.join(PLUGIN_ROOT, dir)

  if (!fs.existsSync(pwd)) {
    fs.mkdirSync(pwd)
  }

  return pwd
}

module.exports = createDirectory
