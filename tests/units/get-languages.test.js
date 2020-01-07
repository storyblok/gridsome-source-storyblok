const { getLanguages } = require('../../utils')

describe('getLanguages function', () => {
  test("getLanguages() should be ['']", () => {
    expect(getLanguages()).toEqual([''])
  })

  test("getLanguages([]) should be ['']", () => {
    expect(getLanguages([])).toEqual([''])
  })

  test("getLanguages(['pt']) should be ['pt/', '']", () => {
    expect(getLanguages(['pt'])).toEqual(['pt/', ''])
  })

  test("getLanguages(['pt', 'de']) should be ['pt/', 'de/', '']", () => {
    expect(getLanguages(['pt', 'de'])).toEqual(['pt/', 'de/', ''])
  })
})
