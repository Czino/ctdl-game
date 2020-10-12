import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import { random } from '../../arrayUtils'
import GameObject from '../../gameObject'
import { CTDLGAME } from '../../gameUtils'
import constants from '../../constants'
import Brian from '../../enemies/Brian'
import { addTextToQueue, setTextQueue } from '../../textUtils'

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
let objects = []

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
const ruinedBuilding3 = [
  [ t10, t20, t20, t20, t01, t64, t64, t64, t74 ],
  [ t110, t34, t34, t34, t34, t34, t34, t310, t32 ],
  [ t34, t34, t18, t34, t34, t18, t310, t07, t32 ],
  [ t34, t34, t19, t34, t34, t19, t07, t07, t32 ],
  [ t34, t34, t34, t34, t34, t210, t07, t07, t32 ],
  [ t34, t34, t34, t34, t34, t34, t34, t210, t32 ],
  [ t34, t34, t18, t34, t34, t18, t34, t310, t32 ],
  [ t34, t34, t19, t34, t34, t19, t34, t07, t32 ],
  [ t34, t34, t34, t34, t34, t34, t310, t07, t32 ],
  [ t34, t34, t34, t34, t34, t34, t210, t07, t32 ],
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
const conbasebg = [
  [ t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t20, t01, t07, t07, t07, t07, t07, t07, t07, t07 ],
  [ t00, t00, t00, t00, t10, t00, t00, t00, t00, t00, t00, t00, t01, t07, t07, t07, t07, t07, t22, t07, t07, t07, t07 ],
  [ t00, t00, t01, t07, t07, t31, t00, t00, t00, t10, t00, t01, t07, t07, t07, t22, t07, t07, t07, t07, t22, t07, t07 ],
  [ t01, t07, t07, t07, t07, t07, t22, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t07, t08, t04 ],
  [ t07, t07, t22, t07, t07, t07, t43, t07, t08, t43, t07, t07, t43, t07, t22, t43, t07, t43, t07, t43, t22, t43, t17 ],
  [ t37, t47, t57, t67, t07, t07, t44, t08, t03, t44, t02, t07, t44, t07, t07, t41, t02, t44, t07, t44, t08, t44, t17 ],
  [ t37, t48, t58, t67, t07, t03, t03, t03, t04, t05, t03, t02, t03, t22, t07, t17, t03, t02, t08, t04, t25, t17, t25 ],
  [ t37, t48, t59, t68, t07, t04, t04, t05, t05, t17, t04, t03, t03, t03, t04, t25, t04, t03, t04, t17, t25, t25, t17 ],
  [ t37, t48, t59, t68, t04, t05, t05, t17, t25, t17, t17, t25, t04, t03, t05, t17, t03, t04, t25, t17, t17, t17, t17 ],
  [ t37, t49, t59, t68, t05, t05, t17, t17, t17, t25, t17, t17, t17, t03, t04, t05, t05, t17, t17, t17, t25, t17, t25 ],
]
const conbasefg = [
  [],
  [],
  [],
  [ t64, t64, t64, t64, t74 ],
  [ t56, t37, t37, t37, t78, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t45 ],
  [ t00, t00, t57, t67, t78, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t45, t25, t17 ],
  [ t00, t00, t00, t68, t78, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t45, t25, t17, t25 ],
  [ t00, t00, t00, t68, t78, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t45, t17, t25, t25, t17 ],
  [ t00, t00, t00, t68, t78, t00, t00, t00, t00, t00, t00, t00, t00, t00, t00, t45, t17, t17, t17, t17, t17, t17 ],
  [ t00, t00, t00, t68, t78, t00, t00, t01, t11, t31, t10, t01, t11, t21, t31, t17, t25, t17, t17, t17, t17, t25 ],
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

parallax = parallax.concat(parsePattern(ruinedBuilding1, 10, 108))
parallax = parallax.concat(parsePattern(ruinedBuilding2, 47, 101))
parallax = parallax.concat(parsePattern(ruinedBuilding1, 63, 108))
parallax = parallax.concat(parsePattern(justWalls, 30, 116))
bg = bg.concat(parsePattern(ruinedBuilding3, -7, 103))
fg = fg.concat(parsePattern(ruinedWall3, -5, 117))
bg = bg.concat(parsePattern(shop, 34, 109))
bg = bg.concat(parsePattern(ruinedWall2, 30, 117))
fg = fg.concat(parsePattern(ruinedWall1, 50, 117))
bg = bg.concat(parsePattern(ruinedBuilding2, 67, 101))
bg = bg.concat(parsePattern(door, 69, 116))
bg = bg.concat(parsePattern(justWalls, 85, 116))
fg = fg.concat(parsePattern(ruinedWall2, 20, 117))
fg = fg.concat(parsePattern(ruinedWall3, 90, 117))
bg = bg.concat(parsePattern(conbasebg, 102, 109))
fg = fg.concat(parsePattern(conbasefg, 102, 109))

const goToShop = new GameObject('goToShop', {
  x: 41 * tileSize,
  y: 116 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

goToShop.backEvent = character => {
  CTDLGAME.showShop = character
}

const goToBuilding = new GameObject('goToBuilding', {
  x: 69 * tileSize,
  y: 116 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

goToBuilding.backEvent = () => {
  setTextQueue([])
  addTextToQueue('Something seems to be\nblocking the entry\nto the building')
}

const goToForest = new GameObject('goToForest', {
  x: 122 * tileSize,
  y: 116 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

goToForest.touchEvent = () => {
  const canGoToForest = !CTDLGAME.objects.find(obj => obj.id === 'brian' && obj.status !== 'rekt')
  if (canGoToForest) {
    changeMap('forest', 'city')
  }
}

objects.push(new Brian(
  'brian',
  {
    x: 970,
    y: 1024 - constants.GROUNDHEIGHT - constants.MENU.h - 31
  }
))

events.push(goToShop)
events.push(goToBuilding)
events.push(goToForest)

export default {
  world: { w: 1000, h: 1024 },
  start: {
    newGame: { x: 60, y: 1024 - constants.GROUNDHEIGHT - constants.MENU.h - 31 },
    forest: { x: 950, y: 1024 - constants.GROUNDHEIGHT - constants.MENU.h - 31 }
  },
  parallax: parallax.map(tile => mapTile(tile, tileSize)),
  bg: bg.map(tile => mapTile(tile, tileSize)),
  fg: fg.map(tile => mapTile(tile, tileSize)),
  objects,
  events,
  track: 'imperayritzDeLaCiutatIoyosa',
  canSetBlocks: true
}