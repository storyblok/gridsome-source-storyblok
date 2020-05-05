/**
 * @method getClientOptions
 * @param  {String} language
 * @param  {Object} options  { version: String }
 * @return {Object}
 */
const getClientOptions = (language = '', options = {}) => {
  if (language.length > 0) {
    options.starts_with = language + (options.starts_with || '*')
  }

  return options
}

module.exports = getClientOptions
