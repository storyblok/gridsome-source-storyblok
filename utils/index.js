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

module.exports = {
  getPath,
  getLanguages,
  getSpace,
  loadAllData,
  loadData,
  transformStory
}