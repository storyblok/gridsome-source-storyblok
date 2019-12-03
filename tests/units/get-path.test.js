const { getPath } = require('../../utils')

describe('getPath function', () => {
  test("getPath() should be 'cdn'", () => {
    expect(getPath()).toBe('cdn/')
  })

  test("getPath('') should be 'cdn'", () => {
    expect(getPath('')).toBe('cdn/')
  })

  test("getPath('stories') should be 'cdn/stories'", () => {
    expect(getPath('stories')).toBe('cdn/stories')
  })

  test("getPath('links') should be 'cdn/links'", () => {
    expect(getPath('links')).toBe('cdn/links')
  })

  test("getPath('tags') should be 'cdn/tags'", () => {
    expect(getPath('tags')).toBe('cdn/tags')
  })
})
