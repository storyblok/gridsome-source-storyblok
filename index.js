const StoryblokClient = require('storyblok-js-client')
const {
  getLanguages,
  getSpace,
  createSchema,
  processData,
  createDirectory
} = require('./utils')
const { IMAGE_DIRECTORY, SOURCE_ROOT } = require('./utils/constants')

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
    const languages = getLanguages(space.language_codes)

    const storyblokOptions = {
      version: options.version || 'draft'
    }

    const typeName = options.typeName || 'StoryblokEntry'
    const types = options.additionalTypes || []
    const downloadImages = options.downloadImages || false
    const imageDirectory = options.imageDirectory || IMAGE_DIRECTORY

    if (downloadImages) {
      createDirectory(`${SOURCE_ROOT}${imageDirectory}`)
    }

    createSchema(store, typeName)

    for (const language of languages) {
      const optionsData = {
        per_page: 25,
        ...options.params,
        ...storyblokOptions
      }
      const entity = {
        type: 'stories',
        name: typeName
      }
      const pluginOptions = {
        downloadImages,
        imageDirectory
      }

      await processData(
        store,
        Storyblok,
        entity,
        optionsData,
        language,
        pluginOptions
      )
    }

    for (const entityType of types) {
      const params = entityType.params || {}
      const optionsData = {
        ...params,
        ...storyblokOptions
      }

      await processData(
        store,
        Storyblok,
        entityType,
        optionsData
      )
    }
  })
}

module.exports = StoryblokPlugin