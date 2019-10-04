const StoryblokClient = require('storyblok-js-client')

/**
 * @method 
 * @param  {StoryblokClient} client  StoryblokClient instance
 * @param  {Int}             page
 * @param  {Object}          options
 * @return {Promise<Object>} StoryblokResponse object { data: { stories: [] }, total, perPage }
 */
const loadData = (client, page, options) => {
  return client.get('cdn/stories', {
    per_page: 25,
    page: page,
    ...options
  })
}

/**
 * @method 
 * @param  {StoryblokClient} client  StoryblokClient instance
 * @param  {Object}          options
 * @return {Array}
 */
const loadAllData = async (client, options) => {
  let page = 1
  let res = await loadData(client, page, options)
  let all = res.data.stories
  let total = res.total
  let lastPage = Math.ceil((total / 25))

  while (page < lastPage) {
    page++
    res = await loadData(client, page, options)
    res.data.stories.forEach(story => {
      all.push(story)
    })
  }

  return all
}

/**
 * @method StoryblokPlugin
 * @param  {Object} api      https://gridsome.org/docs/server-api/
 * @param  {Object} options  { client: { accessToken }, version, typeName }
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

  const Storyblok = new StoryblokClient(options.client || {})

  api.loadSource(async store => {
    const storyblokOptions = {
      version: options.version || 'draft'
    }

    const stories = await loadAllData(Storyblok, storyblokOptions)

    const typeName = options.typeName || 'StoryblokEntry'

    /*  
      TODO: add missing definition of
      * sort_by_date
      * tag_list
      * meta_data
    */
    store.addSchemaTypes(`
      type ${typeName} implements Node {
        content: JSONObject
        name: String
        created_at: Date
        published_at: Date
        id: Int
        slug: String
        full_slug: String
        uuid: String
        path: String
        lang: String
        position: Int
        is_startpage: Boolean
        parent_id: Int
        group_id: String
        first_published_at: Date
        release_id: Int
      }
    `)

    const contents = store.addCollection({
      typeName
    })

    for (const story of stories) {
      contents.addNode({
        ...story
      })
    }
  })
}

module.exports = StoryblokPlugin