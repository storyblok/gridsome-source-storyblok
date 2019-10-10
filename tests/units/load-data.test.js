const { loadData } = require('../../utils')

describe('loadData function', () => {
  test('loadData should call the get function only one time', () => {
    const client = {
      get: jest.fn(() => ({}))
    }
    const entity = 'stories'
    const page = 1
    const options = {
      version: 'draft'
    }
    loadData(client, entity, page, options)

    expect(client.get.mock.calls.length).toBe(1)
  })

  test('loadData with correct path and options ', () => {
    const client = {
      get: jest.fn(() => ({}))
    }
    const entity = 'stories'
    const page = 2
    const options = {
      version: 'published'
    }
    loadData(client, entity, page, options)

    const path = client.get.mock.calls[0][0]
    const _options = client.get.mock.calls[0][1]

    expect(path).toBe('cdn/stories')
    expect(_options).toEqual({
      version: 'published',
      page: 2
    })
  })

  test('loadData with correct path and options when pass a language', () => {
    const client = {
      get: jest.fn(() => ({}))
    }
    const entity = 'tags'
    const page = 2
    const options = {
      version: 'published'
    }
    loadData(client, entity, page, options, 'pt/*')

    const path = client.get.mock.calls[0][0]
    const _options = client.get.mock.calls[0][1]

    expect(path).toBe('cdn/tags')
    expect(_options).toEqual({
      version: 'published',
      page: 2,
      starts_with: 'pt/*'
    })
  })
})