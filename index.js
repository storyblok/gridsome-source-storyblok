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

    const stories = response.data.stories

    const contents = store.addCollection({
      typeName: options.typeName || 'StoryblokEntry'
    })

    for (const story of stories) {
      contents.addNode({
        ...story
      })
    }
  })
}

module.exports = StoryblokPlugin