/**
 * @method transformStory
 * @param  {Object} story Storyblok Story Object
 * @return {Object}       rewrited id field to prevent id conflicts
 */
const transformStory = (story = {}) => {
  const { name, id, lang } = story
  return {
    ...story,
    id: `${name.toLowerCase()}-${id}-${lang}`
  }
}

module.exports = transformStory