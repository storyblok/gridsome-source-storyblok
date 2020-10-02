const StoryblokClient = require('storyblok-js-client')
const {
  getLanguages,
  getSpace,
  createSchema,
  processData,
  createDirectory,
  processTagData,
  processStoriesData,
  filterAdditionalTypes
} = require('./utils')

const {
  IMAGE_DIRECTORY,
  SOURCE_ROOT,
  SCHEMA_NAMES
} = require('./utils/constants')

/**
 * @method StoryblokPlugin
 * @param  {Object} api      https://gridsome.org/docs/server-api/
 * @param  {Object} options
 * @param  {Object} options.client - client configuration
 * @param  {String} options.version - can be draft or published (default draft)
 * @param  {Object} options.types - an options object to setup story and tags
 * @param  {Array}  options.additionalTypes - an array of objects to setup additional types, like datasources, links among others
 */
const StoryblokPlugin = (api, options) => {
  if (!options.client) {
    console.error('[gridsome-source-storyblok] The client option is required')
    return
  }

  if (!options.client.accessToken) {
    console.error('[gridsome-source-storyblok] The accessToken option is required')
    return
  }

  const Storyblok = new StoryblokClient(options.client)
  const typesConfig = options.types || {}
  const tagType = typesConfig.tag || {}
  const storyType = typesConfig.story || {}
  const typeName = storyType.name || SCHEMA_NAMES.STORY
  const tagTypeName = tagType.name || SCHEMA_NAMES.TAG

  api.loadSource(async store => {
    const space = await getSpace(Storyblok)
    const languages = getLanguages(space.language_codes)

    const storyblokOptions = {
      version: options.version || 'draft'
    }

    const schemaNames = {
      typeName,
      tagTypeName
    }

    createSchema(store, schemaNames)

    /**
     * CREATING THE SPACE IN METADATA
     */
    store.addMetadata('STORYBLOK_SPACE', space)

    /**
     * SPECIFIC FOR STORIES ENTRYPOINT
     */
    const downloadImages = options.downloadImages || false
    const imageDirectory = options.imageDirectory || IMAGE_DIRECTORY

    if (downloadImages) {
      createDirectory(`${SOURCE_ROOT}${imageDirectory}`)
    }

    for (const language of languages) {
      const entity = {
        type: 'stories',
        name: typeName
      }

      const optionsData = {
        per_page: 25,
        ...storyType.params || {},
        ...storyblokOptions
      }

      const collection = store.addCollection({
        typeName: entity.name
      })

      // adding a reference in tag_list field to Tags type
      collection.addReference('tag_list', tagTypeName)

      const pluginOptions = {
        downloadImages,
        imageDirectory
      }

      await processStoriesData(
        collection,
        Storyblok,
        entity,
        optionsData,
        language,
        pluginOptions
      )
    }

    /**
     * SPECIFIC FOR TAGS ENTRYPOINT
     */
    const entity = {
      type: 'tags',
      name: tagTypeName
    }

    const optionsData = {
      per_page: 25,
      ...tagType.params || {},
      ...storyblokOptions
    }

    const collection = store.addCollection({
      typeName: entity.name
    })

    await processTagData(
      collection,
      Storyblok,
      entity,
      optionsData
    )

    /**
     * TO ADDITIONAL TYPES
     */
    const additionalTypes = filterAdditionalTypes(options.additionalTypes || [])
    for (const entityType of additionalTypes) {
      const params = entityType.params || {}

      const optionsData = {
        ...params,
        ...storyblokOptions
      }

      const collection = store.addCollection({
        typeName: entityType.name
      })

      await processData(
        collection,
        Storyblok,
        entityType,
        optionsData
      )
    }
  })
}

module.exports = StoryblokPlugin
