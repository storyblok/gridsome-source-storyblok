const getPath = require('./get-path')
const transformStory = require('./transform-story')
const getLanguages = require('./get-languages')
const createSchema = require('./create-schema')
const loadData = require('./load-data')
const processImage = require('./process-image')
const createDirectory = require('./create-directory')

/**
 * @method isStoriesContent
 * @param  {Object} entity  { type: String }
 * @return {Boolean}
 */
const isStoriesContent = entity => entity.type === 'stories'

/**
 * @method
 * @param  {StoryblokClient} client  StoryblokClient instance
 * @param  {String}          entity
 * @param  {Object}          storyBlokOptions
 * @return {Array}
 */
const loadAllData = async (client, entity, storyBlokOptions, language) => {
  let page = 1
  let res = await loadData(client, entity, page, storyBlokOptions, language)
  const all = res.data[entity]
  const total = res.total
  const lastPage = Math.ceil((total / storyBlokOptions.per_page))

  while (page < lastPage) {
    page++
    res = await loadData(client, entity, page, storyBlokOptions, language)
    res.data[entity].forEach(story => {
      all.push(story)
    })
  }

  if (entity === 'stories') {
    // only transform stories to prevent id conflicts
    return all.map(story => transformStory(story))
  }

  return all
}

/**
 * @method getSpace
 * @param  {StoryblokClient} client  StoryblokClient instance
 * @return {Object}                  Storyblok space object
 */
const getSpace = async client => {
  const res = await client.get('cdn/spaces/me')

  return res.data.space || {}
}

/**
 * @method processData
 * @param  {Object} store    Gridsome Data Store API
 * @param  {StoryblokClient} client  StoryblokClient instance
 * @param  {Object} entity   { type: String, name: String }
 * @param  {Object} options
 * @param  {String} language
 */
const processData = async (store, client, entity, storyBlokOptions, language = '', pluginOptions = {}) => {
  const data = await loadAllData(client, entity.type, {
    per_page: 1000,
    ...storyBlokOptions
  }, language)

  const contents = store.addCollection({
    typeName: entity.name
  })

  for (const value of Object.values(data)) {
    if (isStoriesContent(entity) && pluginOptions.downloadImages) {
      console.log(`Processing story ${value.name} to search images and download them...`)
      try {
        await processImage(pluginOptions, value)
      } catch (e) {
        console.error(e)
      }
    }

    contents.addNode({
      ...value
    })
  }
}

module.exports = {
  getPath,
  getSpace,
  loadData,
  loadAllData,
  processData,
  getLanguages,
  createSchema,
  createDirectory,
  transformStory
}
