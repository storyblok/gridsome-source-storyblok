const getClientOptions = require('../../utils/get-client-options')

describe('getClientOptions function', () => {
  test('getClientOptions() should be {}', () => {
    expect(getClientOptions()).toEqual({})
  })

  test("getClientOptions('pt/') should be { starts_with: 'pt/*' }", () => {
    expect(getClientOptions('pt/')).toEqual({ starts_with: 'pt/*' })
  })

  test("getClientOptions('pt/', { page: 1, version: 'draft' }) should be { starts_with: 'pt', page: 1, version: 'draft' }", () => {
    const options = {
      page: 1,
      version: 'draft'
    }
    const result = {
      starts_with: 'pt/*',
      page: 1,
      version: 'draft'
    }
    expect(getClientOptions('pt/', options)).toEqual(result)
  })
})
