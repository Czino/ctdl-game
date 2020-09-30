import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import { random } from '../../arrayUtils'
import GameObject from '../../gameObject'
import { CTDLGAME } from '../../gameUtils'
import constants from '../../constants'
import Ramp from '../../ramp'
import { makeBoundary } from '../../geometryUtils'

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
  t01, t11,
  t02, t12,
  t03, t13,
  t26, t36,
].map(tile => tile.toString())
const solids = [
  t10,
  t04, t14,
  t05, t15,
  t06, t16,
].map(tile => tile.toString())

let parallax = []
let bg = []
let fg = []
let events = []
let objects = []

const bgStart = [
  [ t30, t20, t23, t23 ],
  [ t30, t21, t23, t44 ],
  [ t31, t23, t20, t23 ],
  [ t30, t44, t23, t44 ],
  [ t31, t24, t24, t45 ],
  [ t31, t23, t44, t23 ],
  [ t31, t24, t23, t24 ],
  [ t30, t44, t44, t20 ],
  [ t31, t23, t45, t23 ],
  [ t00, t32, t23, t24 ],
  [ t00, t31, t45, t44 ],
  [ t30, t23, t23, t23 ],
  [ t00, t32, t23, t24 ],
  [ t00, t31, t45, t44 ],
  [ t30, t24, t23, t45 ]
]

const bgTiles = [ t20, t21, t22, t23, t24, t44, t45, t64, t65 ]
const randomBg = () => {
  let rand = []

  for (let i = bgStart.length; i > 0; i--) {
    let row = []
    for (let j = 32; j > 0; j--) {
      row.push(random(bgTiles))
    }
    rand.push(row)
  }
  return rand
}

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
  [ ],
  [ t00, t00, t00, t00, t00, t00, t00, t01, t03, t12, t03, t13 ],
  [ t00, t00, t01, t03, t12, t03, t13, t05, t04, t04, t04, t04 ],
  [ t03, t13, t05, t04, t04, t04, t04, t06, t10, t10, t10, t10 ],
  [ t04, t04, t06, t10, t10, t10, t10, t10, t10, t10, t10, t10 ]
]
const stump = [
  [ t09, t19 ],
  [ t010, t110 ]
]
const bigTree1 = [
  [ t00, t00, t00, t40, t50, t60, t40, t50, t71 ],
  [ t00, t00, t34, t72, t62, t42, t41, t51, t72, t60 ],
  [ t00, t30, t52, t41, t72, t51, t61, t62, t51, t41 ],
  [ t00, t00, t32, t52, t41, t53, t35, t41, t52, t82 ],
  [ t00, t00, t33, t42, t53, t62, t82, t32, t51, t80 ],
  [ t00, t40, t71, t25, t53, t35, t50, t41, t62, t81 ],
  [ t30, t41, t72, t62, t54, t53, t51, t61, t62, t81 ],
  [ t00, t32, t42, t41, t55, t35, t53, t35, t41, t83 ],
  [ t00, t00, t32, t53, t54, t53, t51, t41, t82 ],
  [ t00, t00, t00, t43, t55, t51, t82 ],
  [ t00, t00, t00, t01, t54, t62, t80 ],
  [ t00, t00, t33, t41, t55, t63 ],
  [ t00, t00, t00, t32, t54 ],
  [ t00, t00, t00, t00, t54 ],
  [ t00, t00, t00, t46, t56, t66 ],
]

// create random underground texture
const undergroundTiles = [
  t04, t14
]
for (let i = -30; i < 158; i++) {
  fg.unshift({ x: i, y: 119, tile: random(undergroundTiles) })
}

// create random grass
const grassTiles = [
  t01, t11, t01, t11, t01, t11, t01, t11, t26, t36
]
for (let i = 0; i < 128; i++) {
  fg.unshift({ x: i, y: 118, tile: random(grassTiles) })
}

parallax = parallax.concat(parsePattern(bgStart, 4, 104))
parallax = parallax.concat(parsePattern(randomBg(), 8, 104))
parallax = parallax.concat(parsePattern(bigTree1, 14, 104))
fg = fg.concat(parsePattern(stump, 5, 117))
bg = bg.concat(parsePattern(bigTree1, 7, 104))
fg = fg.concat(parsePattern(bigTree1, 14, 104))
bg = bg.concat(parsePattern(bigTree1, 17, 104))
bg = bg.concat(parsePattern(bigTree1, 22, 104))
fg = fg.concat(parsePattern(bigTree1, 24, 104))
fg = fg.concat(parsePattern(ground, 29, 115))
fg = fg.concat(parsePattern(fillArea([t10], 10, 4), 41, 116))
fg = fg.concat(parsePattern(ground, 39, 113))

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


const gotToCity = new GameObject('gotToCity', {
  x: 1 * tileSize,
  y: 116 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

gotToCity.touchEvent = () => {
  changeMap('city', 'forest')
}
events.push(gotToCity)

export default {
  world: { w: 1000, h: 1024 },
  start: {
    city: { x: 20, y: 1024 - constants.GROUNDHEIGHT - constants.MENU.h - 32}
  },
  parallax: parallax.map(tile => mapTile(tile, tileSize)),
  bg: bg.map(tile => mapTile(tile, tileSize)),
  fg: fg.map(tile => mapTile(tile, tileSize)),
  objects,
  events,
  track: 'santaMaria'
}