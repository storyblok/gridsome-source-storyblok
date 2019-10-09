const getPath = require('./get-path')
const getClientOptions = require('./get-client-options')

/**
 * @method 
 * @param  {StoryblokClient} client  StoryblokClient instance
 * @param  {Int}             page
 * @param  {String}          entity
 * @param  {Object}          options
 * @return {Promise<Object>} StoryblokResponse object { data: { stories: [] }, total, perPage }
 */
const loadData = (client, entity, page, options, language) => {
  const path = getPath(entity)
  const _options = getClientOptions(language || '', { ...options, page })

  return client.get(path, _options)
}

module.exports = loadData