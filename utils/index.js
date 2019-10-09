const getPath = require('./get-path')
const transformStory = require('./transform-story')
const getClientOptions = require('./get-client-options')
const getLanguages = require('./get-languages')
const createSchema = require('./create-schema')

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

/**
 * @method 
 * @param  {StoryblokClient} client  StoryblokClient instance
 * @param  {String}          entity
 * @param  {Object}          options
 * @return {Array}
 */
const loadAllData = async (client, entity, options, language) => {
  let page = 1
  let res = await loadData(client, entity, page, options, language)
  let all = res.data[entity]
  let total = res.total
  let lastPage = Math.ceil((total / options.per_page))

  while (page < lastPage) {
    page++
    res = await loadData(client, entity, page, options, language)
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
const processData = async (store, client, entity, options, language = '') => {
  const data = await loadAllData(client, entity.type, {
    per_page: 1000,
    ...options
  }, language)

  const contents = store.addCollection({
    typeName: entity.name
  })

  for (const value of Object.values(data)) {
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
  transformStory
}