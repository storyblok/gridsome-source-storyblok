const { filterAdditionalTypes } = require('../../utils')

describe('filterAdditionalTypes function', () => {
  test('without arguments should be return a empty array ', () => {
    expect(filterAdditionalTypes()).toEqual([])
  })

  test('with a correct list of additionalTypes, should be return all', () => {
    const options = [
      {
        type: 'links',
        name: 'StoryblokLink'
      },
      {
        type: 'datasources',
        name: 'StoryblokDatasources'
      },
      {
        type: 'datasource_entries',
        name: 'StoryblokDatasourcesEntries'
      }
    ]

    expect(filterAdditionalTypes(options)).toEqual(options)
  })

  test('with a list including tags, should be return all objects without tags', () => {
    const options = [
      {
        type: 'datasources',
        name: 'StoryblokDatasources'
      },
      {
        type: 'datasource_entries',
        name: 'StoryblokDatasourcesEntries'
      },
      {
        type: 'tags',
        name: 'StoryblokTag'
      }
    ]

    const result = [
      {
        type: 'datasources',
        name: 'StoryblokDatasources'
      },
      {
        type: 'datasource_entries',
        name: 'StoryblokDatasourcesEntries'
      }
    ]

    expect(filterAdditionalTypes(options)).toEqual(result)
  })
})
