import { flatten } from '../arrayUtils'


export const parsePattern = (pattern, x, y) => pattern
  .map((row, r) => row.map((tile, c) => ({
    x: x + c,
    y: y + r,
    tile
  })))
  .reduce(flatten)

export default parsePattern