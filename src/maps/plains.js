import { flatten, random } from '../arrayUtils'

const tileSize = 8 // tileSize
let parallex = []
let bg = []
let fg = []

const parsePattern = (pattern, x, y) => pattern
  .map((row, r) => row.map((tile, c) => ({
    x: x + c, y: y + r, tile
  })))
  .reduce(flatten)

const ruinedWall = [
  [ [0, 0], [2, 0], [0, 0], [0, 0], [0, 0], [1, 0], [1, 0] ],
  [ [0, 1], [1, 1], [3, 1], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1] ]
]
const ruinedBuilding = [
  [ [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [1, 0], [2, 0], [0, 1], [6, 4], [6, 4], [6, 4], [7, 4] ],
  [ [0, 0], [0, 0], [0, 0], [0, 0], [0, 1], [0, 7], [0, 7], [1, 10], [3, 4], [3, 4], [3, 4], [2, 4] ],
  [ [0, 0], [0, 0], [0, 0], [0, 0], [0, 7], [0, 7], [1, 10], [3, 4], [3, 4], [3, 4], [3, 4], [2, 4] ],
  [ [0, 0], [0, 0], [0, 0], [0, 0], [2, 10], [0, 7], [2, 8], [3, 4], [3, 4], [3, 4], [3, 4], [2, 4] ],
  [ [0, 0], [0, 0], [0, 0], [0, 1], [3, 10], [1, 10], [3, 4], [3, 4], [3, 4], [3, 4], [3, 4], [2, 4] ],
  [ [0, 0], [1, 0], [0, 1], [0, 7], [0, 7], [0, 10], [3, 4], [3, 4], [3, 10], [3, 10], [0, 7], [3, 2] ],
  [ [0, 1], [0, 7], [0, 7], [0, 7], [0, 7], [0, 6], [2, 7], [2, 7], [0, 2], [0, 7], [0, 7], [3, 2] ],
  [ [0, 7], [0, 7], [0, 7], [0, 7], [0, 7], [0, 4], [2, 5], [5, 8], [0, 2], [0, 7], [0, 7], [3, 2] ],
  [ [0, 7], [0, 7], [0, 7], [0, 7], [0, 4], [0, 5], [1, 7], [5, 9], [0, 3], [0, 2], [0, 7], [3, 2] ],
  [ [0, 4], [0, 5], [0, 5], [0, 5], [0, 5], [1, 7], [1, 5], [5, 9], [0, 5], [0, 3], [0, 2], [3, 2] ],
]

// create random underground texture
const undergroundTiles = [
  [6, 2], [7, 1], [7, 2], [7, 2], [7, 2], [7, 2], [7, 2], [7, 2], [7, 2]
]
for (let i = 0; i < 128; i++) {
  fg.unshift({ x: i, y: 119, tile: random(undergroundTiles) })
}

parallex = parallex.concat(parsePattern(ruinedBuilding, 40, 109))
bg = bg.concat(parsePattern(ruinedWall, 50, 117))
bg = bg.concat(parsePattern(ruinedBuilding, 34, 109))
fg = fg.concat(parsePattern(ruinedWall, 90, 117))

export default {
  parallex: parallex.map(tile => ({
    x: tile.x * tileSize,
    y: tile.y * tileSize + 2,
    tile: tile.tile.map(coord => coord * tileSize),
    w: tileSize,
    h: tileSize
  })),
  bg: bg.map(tile => ({
    x: tile.x * tileSize,
    y: tile.y * tileSize + 2,
    tile: tile.tile.map(coord => coord * tileSize),
    w: tileSize,
    h: tileSize
  })),
  fg: fg.map(tile => ({
    x: tile.x * tileSize,
    y: tile.y * tileSize + 2,
    tile: tile.tile.map(coord => coord * tileSize),
    w: tileSize,
    h: tileSize
  }))
}