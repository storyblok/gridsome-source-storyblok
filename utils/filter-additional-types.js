const { ALLOWED_ADDITIONAL_TYPES } = require('./constants')

/**
 * @method filterAdditionalTypes
 * @param  {Array<Object>} additionalTypes
 * @param  {String} - additionalTypes[].type a name of type (links...)
 * @param  {String} - additionalTypes[].name a name of the entity
 * @param  {Object} - additionalTypes[].params options to request
 * @return {Array<Object>}
 */
const filterAdditionalTypes = (additionalTypes = []) => {
  return additionalTypes.filter(typeObj => {
    const type = typeObj.type || ''
    return ALLOWED_ADDITIONAL_TYPES.includes(type)
  })
}

module.exports = filterAdditionalTypes
