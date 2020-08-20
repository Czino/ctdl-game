import { flatten } from '../src/arrayUtils'
import { deepEqual } from 'assert'

describe('flatten', () => {
  it('flatten arrays in array', () => {
    const deepArray = [1, 2, [3, 4]]
    const flatArray = [1, 2, 3, 4]
    const flattenedArray = deepArray.reduce(flatten, [])

    deepEqual(flattenedArray, flatArray, 'Array correctly flattened')
  })
})