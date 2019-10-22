/**
 * @method transformStory
 * @param  {Object} story Storyblok Story Object
 * @return {Object}       rewrited id field to prevent id conflicts
 */
const transformStory = (story = {}) => {
  const { name, id, lang, path } = story
  delete story.path

  return {
    ...story,
    real_path: path,
    id: `story-${id}-${lang}`
  }
}

module.exports = transformStory