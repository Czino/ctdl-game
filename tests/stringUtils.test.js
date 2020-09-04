import { capitalize } from '../src/stringUtils'
import { equal } from 'assert'

describe('capitalize', () => {
  it('should capitalize first letter of string', () => {
    equal(capitalize('hodlonaut'), 'Hodlonaut', 'String correctly capitalized')
  })
})