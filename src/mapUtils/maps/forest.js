import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import { random } from '../../arrayUtils'
import GameObject from '../../gameObject'
import { CTDLGAME } from '../../gameUtils'
import constants from '../../constants'

const tileSize = 8
const t00 = [0, 0], t01 = [0, 1], t02 = [0, 2], t03 = [0, 3], t04 = [0, 4], t05 = [0, 5], t06 = [0, 6], t07 = [0, 7], t08 = [0, 8], t010 = [0, 10],
  t10 = [1, 0], t11 = [1, 1], t15 = [1, 5], t18 = [1, 8], t17 = [1, 7], t19 = [1, 9], t110 = [1, 10],
  t20 = [2, 0], t21 = [2, 1], t22 = [2, 2], t24 = [2, 4], t25 = [2, 5], t27 = [2, 7], t28 = [2, 8], t210 = [2, 10],
  t31 = [3, 1], t32 = [3, 2], t34 = [3, 4], t37 = [3, 7], t310 = [3, 10],
  t41 = [4, 1], t43 = [4, 3], t44 = [4, 4], t45 = [4, 5], t47 = [4, 7], t48 = [4, 8], t49 = [4, 9],
  t56 = [5, 6], t57 = [5, 7], t58 = [5, 8], t59 = [5, 9],
  t62 = [6, 2], t64 = [6, 4], t67 = [6, 7], t68 = [6, 8],
  t71 = [7, 1], t72 = [7, 2], t74 = [7, 4], t78 = [7, 8]

let parallax = []
let bg = []
let fg = []
let events = []

const ruinedWall1 = [
  [ t00, t20 ],
  [ t01, t11, t21, t31,]
]

// create random underground texture
const undergroundTiles = [
  t62, t71, t72, t72, t72, t72, t72, t72, t72
]
for (let i = -30; i < 158; i++) {
  fg.unshift({ x: i, y: 119, tile: random(undergroundTiles) })
}

// create random grass
const grassTiles = [
  t41, t00, t00, t00, t00, t00
]
for (let i = 0; i < 128; i++) {
  fg.unshift({ x: i, y: 118, tile: random(grassTiles) })
}

fg = fg.concat(parsePattern(ruinedWall1, 5, 117))

export default {
  world: { w: 1000, h: 1024 },
  start: {
    city: { x: 10, y: 1024 - constants.GROUNDHEIGHT - constants.MENU.h - 30}
  },
  parallax: parallax.map(tile => mapTile(tile, tileSize)),
  bg: bg.map(tile => mapTile(tile, tileSize)),
  fg: fg.map(tile => mapTile(tile, tileSize)),
  events
}