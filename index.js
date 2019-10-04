const StoryblokClient = require('storyblok-js-client')

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
    const response = await Storyblok.get('cdn/stories', {
      version: options.version || 'draft'
    })

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

    const stories = response.data.stories

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