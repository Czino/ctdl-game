import { mapTile, parsePattern } from '../mapUtils'
import { random } from '../arrayUtils'

const tileSize = 8 // tileSize
const t00 = [0, 0], t01 = [0, 1], t02 = [0, 2], t03 = [0, 3], t04 = [0, 4], t05 = [0, 5], t06 = [0, 6], t07 = [0, 7], t010 = [0, 10],
  t10 = [1, 0], t11 = [1, 1], t15 = [1, 5], t18 = [1, 8], t17 = [1, 7], t19 = [1, 9], t110 = [1, 10],
  t20 = [2, 0], t21 = [2, 1], t24 = [2, 4], t25 = [2, 5], t27 = [2, 7], t28 = [2, 8], t210 = [2, 10],
  t31 = [3, 1], t32 = [3, 2], t34 = [3, 4], t37 = [3, 7], t310 = [3, 10],
  t41 = [4, 1], t43 = [4, 3], t44 = [4, 4], t47 = [4, 7], t48 = [4, 8], t49 = [4, 9],
  t56 = [5, 6], t57 = [5, 7], t58 = [5, 8], t59 = [5, 9],
  t62 = [6, 2], t64 = [6, 4], t67 = [6, 7], t68 = [6, 8],
  t71 = [7, 1], t72 = [7, 2], t74 = [7, 4], t78 = [7, 8]

let parallax = []
let bg = []
let fg = []

const ruinedWall1 = [
  [ t00, t20 ],
  [ t01, t11, t21, t31,]
]
const ruinedWall2 = [
  [ t00, t20 ],
  [ t01, t11, t31 ]
]
const ruinedWall3 = [
  [ t00, t20, t00, t00, t00, t10, t10 ],
  [ t01, t11, t31, t10, t01, t11, t21, t31 ]
]
const ruinedBuilding1 = [
  [ t00, t00, t00, t00,  t00, t01, t07, t07, t32 ],
  [ t10, t00, t00, t20, t01, t18, t07, t07, t32 ],
  [ t34, t31, t00, t07, t07, t19, t34, t210, t32 ],
  [ t34, t310, t07, t07, t07, t110, t34, t310, t32 ],
  [ t310, t07, t07, t07, t110, t34, t34, t07, t32 ],
  [ t210, t07, t18, t07, t34, t18, t310, t07, t32 ],
  [ t34, t210, t19, t110, t34, t19, t210, t07, t32 ],
  [ t34, t34, t34, t34, t34, t34, t34, t34, t24 ],
  [ t34, t34, t34, t34, t34, t34, t34, t34, t24 ],
  [ t34, t34, t34, t34, t34, t58, t34, t34, t24 ],
  [ t34, t34, t34, t34, t34, t59, t34, t34, t24 ],
]
const ruinedBuilding2 = [
  [ t10, t20, t20, t20, t01, t64, t64, t64, t74 ],
  [ t110, t34, t34, t34, t34, t34, t34, t34, t24 ],
  [ t34, t34, t34, t34, t34, t34, t34, t34, t24 ],
  [ t34, t34, t34, t34, t34, t34, t34, t34, t24 ],
  [ t34, t34, t18, t34, t34, t18, t34, t34, t24 ],
  [ t34, t34, t19, t34, t34, t19, t34, t34, t24 ],
  [ t34, t34, t34, t34, t34, t34, t34, t34, t24 ],
  [ t34, t34, t34, t34, t34, t34, t34, t34, t24 ],
  [ t34, t34, t18, t34, t34, t18, t34, t34, t24 ],
  [ t34, t34, t19, t34, t34, t19, t34, t34, t24 ],
  [ t34, t34, t34, t34, t34, t34, t34, t34, t24 ],
  [ t34, t34, t34, t34, t34, t34, t34, t34, t24 ],
  [ t34, t34, t18, t34, t34, t18, t34, t310, t32 ],
  [ t34, t34, t19, t34, t34, t19, t34, t210, t32 ],
  [ t34, t34, t34, t34, t34, t34, t34, t34, t24 ],
  [ t34, t34, t34, t34, t34, t34, t34, t34, t24 ],
  [ t34, t34, t58, t34, t34, t34, t34, t34, t24 ],
  [ t34, t34, t59, t34, t34, t34, t34, t34, t24 ],
]
const justWalls = [
  [ t00, t00, t00, t00,  t20, t01, t07, t07, t31 ],
  [ t00, t00, t00, t01, t07, t07, t07, t07, t32 ],
  [ t10, t00, t01, t07, t07, t07, t07, t07, t32 ],
]
const cont10sebg = [
  [ t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t20, t01, t07, t07, t31 ],
  [ t00, t00, t00, t00, t10, t00, t00, t00, t00, t00, t00, t00, t01, t07, t07, t07, t07, t32 ],
  [ t00, t00, t01, t07, t07, t31, t00, t00, t00, t10, t00, t01, t07, t07, t07, t07, t07, t32 ],
  [ t01, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t32 ],
  [ t07, t07, t07, t07, t07, t07, t43, t07, t07, t43, t07, t07, t43, t07, t07, t43, t07, t32 ],
  [ t37, t47, t57, t67, t07, t07, t44, t07, t07, t44, t07, t07, t44, t07, t07, t44, t07, t32 ],
  [ t37, t48, t58, t67, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t32 ],
  [ t37, t48, t59, t68, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t32 ],
  [ t37, t48, t59, t68, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t32 ],
  [ t37, t49, t59, t68, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t32 ],
]
const cont10sefg = [
  [],
  [],
  [],
  [ t64, t64, t64, t64, t74 ],
  [ t56, t37, t37, t37, t78 ],
  [ t00, t00, t57, t67, t78 ],
  [ t00, t00, t00, t68, t78 ],
  [ t00, t00, t00, t68, t78 ],
  [ t00, t00, t00, t68, t78 ],
  [ t00, t00, t00, t68, t78, t00, t00, t01, t11, t31, t10, t01, t11, t21, t31 ],
]
const shop = [
  [ t00, t00, t00, t00, t00, t10, t20, t01, t64, t64, t64, t74 ],
  [ t00, t00, t00, t00, t01, t07, t07, t110, t34, t34, t34, t24 ],
  [ t00, t00, t00, t00, t07, t07, t110, t34, t34, t34, t34, t24 ],
  [ t00, t00, t00, t00, t210, t07, t28, t18, t34, t34, t34, t24 ],
  [ t00, t00, t00, t01, t310, t110, t34, t19, t34, t34, t34, t24 ],
  [ t00, t10, t01, t07, t07, t010, t34, t34, t310, t310, t07, t32 ],
  [ t01, t07, t07, t07, t07, t06, t27, t27, t02, t07, t07, t32 ],
  [ t07, t07, t07, t07, t07, t04, t25, t58, t02, t07, t07, t32 ],
  [ t07, t07, t07, t07, t04, t05, t17, t59, t03, t02, t07, t32 ],
  [ t04, t05, t05, t05, t05, t17, t15, t59, t05, t03, t02, t32 ],
]
const door = [
  [ t58 ],
  [ t59 ],
  [ t59 ]
]

// create random underground texture
const undergroundTiles = [
  t62, t71, t72, t72, t72, t72, t72, t72, t72
]
for (let i = 0; i < 128; i++) {
  fg.unshift({ x: i, y: 119, tile: random(undergroundTiles) })
}

// create random grass
const grassTiles = [
  t41, t00, t00, t00, t00, t00
]
for (let i = 0; i < 128; i++) {
  fg.unshift({ x: i, y: 118, tile: random(grassTiles) })
}

parallax = parallax.concat(parsePattern(ruinedBuilding1, 10, 108))
parallax = parallax.concat(parsePattern(ruinedBuilding2, 47, 101))
parallax = parallax.concat(parsePattern(ruinedBuilding1, 63, 108))
parallax = parallax.concat(parsePattern(justWalls, 30, 116))
bg = bg.concat(parsePattern(shop, 34, 109))
bg = bg.concat(parsePattern(ruinedWall2, 30, 117))
fg = fg.concat(parsePattern(ruinedWall1, 50, 117))
bg = bg.concat(parsePattern(ruinedBuilding2, 67, 101))
bg = bg.concat(parsePattern(door, 69, 116))
bg = bg.concat(parsePattern(justWalls, 85, 116))
fg = fg.concat(parsePattern(ruinedWall2, 20, 117))
fg = fg.concat(parsePattern(ruinedWall3, 90, 117))
bg = bg.concat(parsePattern(cont10sebg, 110, 109))
fg = fg.concat(parsePattern(cont10sefg, 110, 109))

export default {
  parallax: parallax.map(tile => mapTile(tile, tileSize)),
  bg: bg.map(tile => mapTile(tile, tileSize)),
  fg: fg.map(tile => mapTile(tile, tileSize))
}