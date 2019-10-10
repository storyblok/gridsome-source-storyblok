/**
 * @method getClientOptions
 * @param  {String} language
 * @param  {Object} options  { version: String }
 * @return {Object}
 */
const getClientOptions = (language = '', options = {}) => {
  let params = {}

  if (options.version) {
    params['version'] = options.version
  }

  if (options.page) {
    params['page'] = options.page
  }

  if (language.length > 0) {
    params['starts_with'] = language
  }

  return params
}

module.exports = getClientOptions