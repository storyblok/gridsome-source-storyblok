const { createSchema } = require('../../utils')

/**
 * Get the order argument and remove spaces because use literal templates
 *
 * @method getCallResult
 * @param  {Function} fn  function mocked
 * @param  {Number} order order
 * @return {String}
 */
const getCallResult = (fn, order) => {
  return fn.mock.calls[order][0].replace(/\s/g, '')
}

describe('createSchema function', () => {
  test('call createSchema should be call addSchemaTypes function 3 times', () => {
    const store = {}
    store.addSchemaTypes = jest.fn(str => str)
    createSchema(store)

    expect(store.addSchemaTypes.mock.calls.length).toBe(3)
  })

  test('the second function call receive a correct implementation of StoryblokTag node', () => {
    const result = `
    type StoryblokTag implements Node {
      id: ID!
      name: String!
      taggings_count: Int!
    }`

    const store = {}
    store.addSchemaTypes = jest.fn(str => str)
    createSchema(store, {})

    const data = getCallResult(store.addSchemaTypes, 1)

    expect(data).toEqual(result.replace(/\s/g, ''))
  })

  test('the third function call receive a correct implementation of StoryblokEntry node', () => {
    const result = `
    type StoryblokEntry implements Node {
      content: JSONObject
      name: String!
      created_at: Date
      published_at: Date
      id: ID!
      slug: String!
      full_slug: String!
      uuid: String!
      real_path: String
      lang: String
      position: Int
      is_startpage: Boolean
      parent_id: Int
      group_id: String
      first_published_at: Date
      release_id: Int
      tag_list: [StoryblokTag!]!
      meta_data: JSONObject
      sort_by_date: Date
      alternates: [AlternateStory!]!
    }`

    const store = {}
    store.addSchemaTypes = jest.fn(str => str)
    createSchema(store, {})

    const data = getCallResult(store.addSchemaTypes, 2)

    expect(data).toEqual(result.replace(/\s/g, ''))
  })

  test('when call createSchema with another parameters, the schema should be created with them', () => {
    const tagResult = `
    type Tag implements Node {
      id: ID!
      name: String!
      taggings_count: Int!
    }`

    const storyResult = `
    type Story implements Node {
      content: JSONObject
      name: String!
      created_at: Date
      published_at: Date
      id: ID!
      slug: String!
      full_slug: String!
      uuid: String!
      real_path: String
      lang: String
      position: Int
      is_startpage: Boolean
      parent_id: Int
      group_id: String
      first_published_at: Date
      release_id: Int
      tag_list: [Tag!]!
      meta_data: JSONObject
      sort_by_date: Date
      alternates: [AlternateStory!]!
    }`

    const store = {}
    store.addSchemaTypes = jest.fn(str => str)
    const config = {
      typeName: 'Story',
      tagTypeName: 'Tag'
    }

    createSchema(store, config)
    // get the second and the third arguments and remove spaces because use literal templates
    const tagData = getCallResult(store.addSchemaTypes, 1)
    const storyData = getCallResult(store.addSchemaTypes, 2)

    expect(tagData).toEqual(tagResult.replace(/\s/g, ''))
    expect(storyData).toEqual(storyResult.replace(/\s/g, ''))
  })
})
