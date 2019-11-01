const { createSchema } = require('../../utils')

describe('createSchema function', () => {
  test(`call createSchema should be call addSchemaTypes function twice`, () => {
    const store = {}
    store.addSchemaTypes = jest.fn(str => str)
    createSchema(store, 'StoryblokEntry')

    expect(store.addSchemaTypes.mock.calls.length).toBe(2)
  })

  test('the second function call receive a correct implementation of type node', () => {
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
      tag_list: [String!]!
      meta_data: JSONObject
      sort_by_date: Date
      alternates: [AlternateStory!]!
    }`

    const store = {}
    store.addSchemaTypes = jest.fn(str => str)
    createSchema(store, 'StoryblokEntry')
    // get the second argument and remove spaces because use literal templates
    const data = store.addSchemaTypes.mock.calls[1][0].replace(/\s/g, '')

    expect(data).toEqual(result.replace(/\s/g, ''))
  })
  
})