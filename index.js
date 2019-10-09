const StoryblokClient = require('storyblok-js-client')
const { getLanguages, loadAllData, getSpace, createSchema } = require('./utils')

/**
 * @method StoryblokPlugin
 * @param  {Object} api      https://gridsome.org/docs/server-api/
 * @param  {Object} options  { client: { accessToken }, version, typeName, params: {}, additionalTypes: [] }
 */
const StoryblokPlugin = (api, options) => {
  if (!options.client) {
    console.error('The client option is required')
    return
  }

  if (!options.client.accessToken) {
    console.error('The accessToken option is required')
    return
  }

  const Storyblok = new StoryblokClient(options.client)

  api.loadSource(async store => {
    const space = await getSpace(Storyblok)
    const languages = getLanguages(space)

    const storyblokOptions = {
      version: options.version || 'draft'
    }

    const typeName = options.typeName || 'StoryblokEntry'
    const types = [
      {
        type: 'stories',
        name: typeName,
        params: {
          per_page: 25,
          ...options.params
        }
      },
      ...options.additionalTypes || []
    ]

    createSchema(store, typeName)

    for (const language of languages) {
      for (const entityType of types) {
        const params = entityType.params || {}
        const entities = await loadAllData(Storyblok, entityType.type, {
          per_page: 1000,
          ...params,
          ...storyblokOptions
        }, language)
  
        const contents = store.addCollection({
          typeName: entityType.name
        })
  
        if (entityType.type == 'links') {
          for (const entity in entities) {
            contents.addNode({
              ...entities[entity]
            })
          }
        } else {
          for (const entity of entities) {
            contents.addNode({
              ...entity
            })
          }
        }
      }
    }
  })
}

module.exports = StoryblokPlugin