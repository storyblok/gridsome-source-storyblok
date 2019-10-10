/**
 * @method getLanguages
 * @param  {Array} space  language_codes from Space Object from Storyblok API
 * @return {Array<String>} can be [''] (only one language) or ['', 'pt/*'] with two or more languages
 */
const getLanguages = (codes = []) => {
  return [
    ...codes.map(lang => lang + '/*'),
    '' // default languages does not need transform path
  ]
}

module.exports = getLanguages