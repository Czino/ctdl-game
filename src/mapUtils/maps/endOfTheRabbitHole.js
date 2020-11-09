import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import { random } from '../../arrayUtils'
import GameObject from '../../gameObject'
import constants from '../../constants'
import Ramp from '../../Ramp'
import { makeBoundary } from '../../geometryUtils'
import NPC from '../../npcs/NPC'
import { CTDLGAME } from '../../gameUtils'

const worldWidth = 128
const worldHeight = 128
const tileSize = 8
const t00 = [0, 0], t01 = [0, 1], t02 = [0, 2], t03 = [0, 3], t04 = [0, 4], t05 = [0, 5], t06 = [0, 6], t07 = [0, 7], t08 = [0, 8], t09 = [0, 9], t010 = [0, 10],
  t10 = [1, 0], t11 = [1, 1], t12 = [1, 2], t13 = [1, 3], t14 = [1, 4], t15 = [1, 5], t16 = [1, 6], t17 = [1, 7], t18 = [1, 8], t19 = [1, 9], t110 = [1, 10],
  t20 = [2, 0], t21 = [2, 1], t22 = [2, 2], t23 = [2, 3], t24 = [2, 4], t25 = [2, 5], t26 = [2, 6], t27 = [2, 7], t28 = [2, 8], t29 = [2, 9], t210 = [2, 10],
  t30 = [3, 0], t31 = [3, 1], t32 = [3, 2], t33 = [3, 3], t34 = [3, 4], t35 = [3, 5], t36 = [3, 6], t37 = [3, 7], t38 = [3, 8], t39 = [3, 9], t310 = [3, 10],
  t40 = [4, 0], t41 = [4, 1], t42 = [4, 2], t43 = [4, 3], t44 = [4, 4], t45 = [4, 5], t46 = [4, 6], t47 = [4, 7], t48 = [4, 8], t49 = [4, 9], t410 = [4, 10],
  t50 = [5, 0], t51 = [5, 1], t52 = [5, 2], t53 = [5, 3], t54 = [5, 4], t55 = [5, 5], t56 = [5, 6], t57 = [5, 7], t58 = [5, 8], t59 = [5, 9], t510 = [5, 10],
  t60 = [6, 0], t61 = [6, 1], t62 = [6, 2], t63 = [6, 3], t64 = [6, 4], t65 = [6, 5], t66 = [6, 6], t67 = [6, 7], t68 = [6, 8], t69 = [6, 9], t610 = [6, 10],
  t70 = [7, 0], t71 = [7, 1], t72 = [7, 2], t73 = [7, 3], t74 = [7, 4], t75 = [7, 5], t76 = [7, 6], t77 = [7, 7], t78 = [7, 8], t79 = [7, 9], t710 = [7, 10],
  t80 = [8, 0], t81 = [8, 1], t82 = [8, 2], t83 = [8, 3], t84 = [8, 4], t85 = [8, 5], t86 = [8, 6], t87 = [8, 7], t88 = [8, 8], t89 = [8, 9], t810 = [8, 10]

const ramps = [
  t20, t34, t40, t50, t51, t60, t70, t71,
  t01, t11,
  t02, t12,
  t03, t13,
  t04, t14,
  t05, t15,
  t26, t36,
  t59, t69, t510, t610,
  t76, t86
].map(tile => tile.toString())
const solids = [
  t10, t14, t77, t87, t78, t88
].map(tile => tile.toString())
const undergroundTiles = [
  t04, t14
]

let parallax = []
let bg = []
let fg = []
let events = []
let objects = []

const fillArea = (tiles, w, h) => {
  let area = []

  for (let i = h; i > 0; i--) {
    let row = []
    for (let j = w; j > 0; j--) {
      row.push(random(tiles))
    }
    area.push(row)
  }
  return area
}

const ground = [
  [ t01, t21, t31, t11, t21, t31, t01, t21, t31, t11, t01, t01 ],
  [ t14, t14, t14, t14, t14, t14, t14, t14, t14, t14, t14, t14 ]
]

const makeConsolidatedBoundary = (x, y, w, h, tileSize) => {
  objects.push(makeBoundary({
    x: x * tileSize,
    y: y * tileSize,
    w: w * tileSize,
    h: h * tileSize,
  }))
}

makeConsolidatedBoundary(0, 0, worldWidth, 1, tileSize)
makeConsolidatedBoundary(worldWidth, 0, 1, worldHeight, tileSize)
makeConsolidatedBoundary(0, 0, 1, worldHeight, tileSize)

fg = fg.concat(parsePattern(ground, 64, 10))
fg = fg.concat(parsePattern(ground, 76, 10))

fg.forEach(tile => {
  if (ramps.indexOf(tile.tile.toString()) !== -1) {
    objects.push(new Ramp(
      'ramp',
      constants.bgContext,
      {
        x: tile.x * tileSize,
        y: tile.y * tileSize + 3,
        w: tileSize,
        h: tileSize,
        sprite: 'forest',
        spriteData: { x: tile.tile[0] * tileSize, y: tile.tile[1] * tileSize, w: tileSize, h: tileSize},
        direction: 'right',
        isSolid: true,
      },
    ))
  } else if (solids.indexOf(tile.tile.toString()) !== -1) {
    objects.push(makeBoundary({
      x: tile.x * tileSize,
      y: tile.y * tileSize + 3,
      w: tileSize,
      h: tileSize
    }))
  }
})

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    rabbitHole: { x: 552, y: 0}
  },
  parallax: parallax.map(tile => mapTile(tile, tileSize)),
  bg: bg.map(tile => mapTile(tile, tileSize)),
  fg: fg.map(tile => mapTile(tile, tileSize)),
  objects,
  npcs: () => [
    new NPC(
      'dancer1',
      {
        x: 71 * tileSize,
        y: 8 * tileSize
      }
    ),
    new NPC(
      'dancer2',
      {
        x: 67 * tileSize,
        y: 8 * tileSize
      }
    ),
    new NPC(
      'dancer3',
      {
        x: 72 * tileSize,
        y: 8 * tileSize
      }
    ),
    new NPC(
      'dancer4',
      {
        x: 69 * tileSize,
        y: 8 * tileSize
      }
    ),
    new NPC(
      'dancer5',
      {
        x: 75 * tileSize,
        y: 8 * tileSize
      }
    )
  ],
  events,
  track: 'endOfTheRabbitHole',
  bgColor: () => '#270b08',
  update: () => {
    constants.menuContext.globalAlpha = .2
    constants.menuContext.fillStyle = CTDLGAME.frame % 32 >= 16 ? '#c8006e' : '#cd8812'
    constants.menuContext.fillRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
    constants.menuContext.globalAlpha = 1
  },
  spawnRates: {}
}