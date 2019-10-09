/**
 * @method getPath
 * @param  {String} entity
 * @param  {String} language can be '' (default)
 * @return {String}
 */
const getPath = (entity, language) => {
  const languagePath = language.length > 0 ? `?starts_with=${language}` : ''
  return `cdn/${entity}${languagePath}`
}

/**
 * @method transformStory
 * @param  {Object} story Storyblok Story Object
 * @return {Object}       rewrited id field to prevent id conflicts
 */
const transformStory = story => {
  const { name, id, lang } = story
  return {
    ...story,
    id: `${name.toLowerCase()}-${id}-${lang}`
  }
}

/**
 * @method 
 * @param  {StoryblokClient} client  StoryblokClient instance
 * @param  {Int}             page
 * @param  {String}          entity
 * @param  {Object}          options
 * @return {Promise<Object>} StoryblokResponse object { data: { stories: [] }, total, perPage }
 */
const loadData = (client, entity, page, options, language) => {
  const path = getPath(entity, language)
  return client.get(path, {
    page: page,
    ...options
  })
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

const getLanguages = space => {
  return [
    ...space.language_codes.map(lang => lang + '/*'),
    '' // default languages does not need transform path
  ]
}

/**
 * @method createSchema
 * @param  {Object} store    Gridsome Data Store API
 * @param  {String} typeName typeName from plugin option
 */
const createSchema = (store, typeName) => {
  store.addSchemaTypes(`
    type AlternateStory {
      id: ID!
      name: String!
      slug: String!
      published: Boolean
      full_slug: String!
      is_folder: Boolean
      parent_id: Int
    }
  `)

  store.addSchemaTypes(`
    type ${typeName} implements Node {
      content: JSONObject
      name: String!
      created_at: Date
      published_at: Date
      id: ID!
      slug: String!
      full_slug: String!
      uuid: String!
      path: String
      lang: String
      position: Int
      is_startpage: Boolean
      parent_id: Int
      group_id: String
      first_published_at: Date
      release_id: Int
      tag_list: [String!]!
      meta_data: JSONObject
      sort_by_date: Date
      alternates: [AlternateStory!]!
    }
  `)
}

module.exports = {
  getPath,
  getLanguages,
  getSpace,
  loadAllData,
  loadData,
  createSchema,
  transformStory
}