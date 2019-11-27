/**
 * @method getPath
 * @param  {String} entity
 * @return {String}
 */
const getPath = (entity = '') => `cdn/${entity}`

module.exports = getPath
