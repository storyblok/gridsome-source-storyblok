const StoryblokClient = require('storyblok-js-client')

/**
 * @method 
 * @param  {StoryblokClient} client  StoryblokClient instance
 * @param  {Int}             page
 * @param  {String}          entity
 * @param  {Object}          options
 * @return {Promise<Object>} StoryblokResponse object { data: { stories: [] }, total, perPage }
 */
const loadData = (client, entity, page, options) => {
  return client.get(`cdn/${entity}`, {
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
const loadAllData = async (client, entity, options) => {
  let page = 1
  let res = await loadData(client, entity, page, options)
  let all = res.data[entity]
  let total = res.total
  let lastPage = Math.ceil((total / options.per_page))

  while (page < lastPage) {
    page++
    res = await loadData(client, entity, page, options)
    res.data[entity].forEach(story => {
      all.push(story)
    })
  }

  return all
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

    for (const entityType of types) {
      const params = entityType.params || {}
      const entities = await loadAllData(Storyblok, entityType.type, {
        per_page: 1000,
        ...params,
        ...storyblokOptions
      })

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
  })
}

module.exports = StoryblokPlugin