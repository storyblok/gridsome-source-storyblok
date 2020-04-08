const PLUGIN_ROOT = process.cwd()

const IMAGE_DIRECTORY = 'storyblok_images'

const SOURCE_ROOT = 'src/'

const SCHEMA_NAMES = {
  TAG: 'StoryblokTag',
  STORY: 'StoryblokEntry'
}

const ALLOWED_ADDITIONAL_TYPES = ['datasources', 'datasource_entries', 'links']

module.exports = {
  PLUGIN_ROOT,
  IMAGE_DIRECTORY,
  SOURCE_ROOT,
  SCHEMA_NAMES,
  ALLOWED_ADDITIONAL_TYPES
}
