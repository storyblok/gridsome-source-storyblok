const StoryblokClient = require('storyblok-js-client')

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
    let types = options.additionalTypes || []
    types.push({type: 'stories', name: typeName, params: {
      per_page: 25,
      ...options.params
    }})

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