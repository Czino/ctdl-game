import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import { random } from '../../arrayUtils'
import GameObject from '../../gameObject'
import { CTDLGAME } from '../../gameUtils'
import constants from '../../constants'
import Ramp from '../../ramp'
import { makeBoundary } from '../../geometryUtils'
import Bear from '../../bear'

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
  t26, t36,
  t59, t69, t510, t610,
  t76, t86
].map(tile => tile.toString())
const solids = [
  t10, t04, t14, t77, t87, t78, t88
].map(tile => tile.toString())
const undergroundTiles = [
  t04, t14
]
const grassTiles = [
  t01, t11, t01, t11, t01, t11, t01, t11, t26, t36
]

let parallax = []
let bg = []
let fg = []
let events = []
let objects = []

const bgStart = [
  [ t00, t00, t03, t12 ],
  [ t00, t13, t23, t44 ],
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
  [ t00, t32, t23, t24 ]
]

const bgTopTiles = [ t01, t11, t12 ]
const bgTiles = [ t20, t21, t22, t23, t24, t44, t45, t64, t65 ]
const randomBg = () => {
  let rand = []

  let topRow = []
  for (let j = 32; j > 0; j--) {
    topRow.push(random(bgTopTiles))
  }
  rand.push(topRow)

  for (let i = bgStart.length - 1; i > 0; i--) {
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

const groundUp = [
  [ ],
  [ t00, t00, t00, t00, t00, t00, t00, t01, t03, t12, t03, t13 ],
  [ t00, t00, t01, t03, t12, t03, t13, t05, t04, t04, t04, t04 ],
  [ t03, t13, t05, t04, t04, t04, t04, t06, t10, t10, t10, t10 ],
  [ t04, t04, t06, t10, t10, t10, t10, t10, t10, t10, t10, t10 ]
]
const groundDown = [
  [ ],
  [ t11, t12 ],
  [ t04, t15, t02, t36, t12 ],
  [ t10, t16, t14, t04, t15, t02, t12 ],
  [ t10, t10, t10, t10, t16, t04, t15, t02, t12 ],
  [ t10, t10, t10, t10, t10, t10, t16, t14, t15, t02 ],
  [ t10, t10, t10, t10, t10, t10, t10, t10, t16, t14 ]
]
const groundDownTwistBg = [
  [ ],
  [ ],
  [ t16, t04, t14, t14, t04, t04 ],
  [ t00, t10, t37, t37, t27, t03, t10 ],
  [ t00, t00, t00 ],
]

const groundDownTwist = [
  [ t01, t12 ],
  [ t15, t20, t02, t01, t03, t12, t00, t00, t00, t00, t00, t03, t12, t01 ],
  [ t00, t20, t21, t21, t23, t24, t02, t00, t00, t03, t13, t05, t04, t04 ],
  [ t00, t37, t37, t27, t37, t28, t38, t03, t13, t05, t04, t06, t10, t10 ],
  [ t00, t00, t00, t03, t13, t05, t04, t04, t04, t06, t10, t10, t10, t10 ],
  [ t00, t03, t13, t05, t04, t06, t10, t10, t10, t10, t10, t10, t10, t10 ]
]

const log = [
  [ t07, t17 ],
  [ t08, t18 ]
]
const stump = [
  [ t09, t19 ],
  [ t010, t110 ]
]
const stumpMoss = [
  [ t76, t86 ],
  [ t77, t87 ],
  [ t78, t88 ],
]
const mushroom1 = [
  [ t29 ]
]
const mushroom2 = [
  [ t39 ]
]
const mushroom3 = [
  [ t210 ]
]
const mushroom4 = [
  [ t310 ]
]
const mushroom5 = [
  [ t410 ]
]
const smallStone = [
  [ t59 ]
]
const stone = [
  [ t00, t69 ],
  [ t510, t610 ]
]
const smallStoneMoss = [
  [ t79 ]
]
const stoneMoss = [
  [ t00, t89 ],
  [ t710, t810 ]
]

const bigTree1 = [
  [ t00, t00, t00, t40, t50, t60, t40, t50, t71 ],
  [ t00, t00, t34, t72, t62, t42, t41, t51, t72, t60 ],
  [ t00, t30, t52, t41, t72, t51, t61, t62, t51, t41 ],
  [ t00, t00, t32, t52, t41, t53, t35, t41, t52, t82 ],
  [ t00, t00, t40, t42, t53, t62, t82, t32, t51, t80 ],
  [ t00, t40, t41, t25, t53, t35, t50, t41, t62, t81 ],
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

const bigTree2 = [
  [ t00, t00, t00, t00, t00, t00, t00, t00 ],
  [ t00, t40, t50, t50, t60, t00, t00, t00 ],
  [ t31, t72, t42, t72, t41, t70, t40, t50, t60 ],
  [ t30, t52, t42, t62, t41, t52, t42, t62, t42, t70 ],
  [ t00, t32, t41, t72, t62, t62, t35, t52, t41, t41, t81 ],
  [ t00, t30, t74, t62, t72, t25, t62, t41, t51, t61, t83 ],
  [ t00, t34, t52, t25, t52, t62, t52, t82, t27, t37 ],
  [ t30, t41, t72, t42, t42, t53, t85, t00 ],
  [ t31, t62, t42, t42, t74, t54, t71, t40, t50, t71 ],
  [ t33, t42, t52, t72, t32, t55, t72, t72, t62, t41, t80 ],
  [ t00, t32, t72, t82, t01, t54, t85, t43, t61, t82 ],
  [ t00, t00, t27, t33, t41, t55, t12 ],
  [ t00, t00, t00, t00, t32, t54, t85 ],
  [ t00, t00, t00, t00, t00, t54 ],
  [ t00, t00, t00, t00, t47, t57, t67 ],
]

const climbTree = [
  [ t00, t00, t00, t34, t50, t60, t00 ],
  [ t00, t40, t50, t61, t72, t61, t81 ],
  [ t31, t41, t61, t51, t41, t72, t83 ],
  [ t33, t42, t51, t72, t61, t82, t00 ],
  [ t00, t43, t42, t52, t62, t80, t00 ],
  [ t00, t00, t43, t53, t63, t00, t00 ],
  [ t00, t00, t00, t54, t00, t00, t00 ],
  [ t00, t12, t00, t55, t40, t50, t60 ],
  [ t34, t20, t70, t54, t82, t27, t37 ],
  [ t43, t41, t51, t54, t50, t60, t00 ],
  [ t00, t32, t42, t57, t53, t84, t81 ],
]

const bush = [
  [ t00, t40, t50, t60, t40, t50, t70 ],
  [ t31, t20, t62, t41, t51, t41, t37 ],
  [ t30, t42, t41, t51, t61, t53, t60 ],
  [ t00, t32, t42, t74, t53, t84, t41, t81 ],
]

const branches = [
  [ t00, t34, t50, t50, t50, t70 ],
  [ t34, t61, t51, t41, t51, t62, t80 ],
  [ t32, t73, t82, t33, t73, t82 ],
]
const branches2 = [
  [ t00, t00, t01 ],
  [ t00, t34, t61, t70, t01, t00, t03],
  [ t30, t41, t61, t51, t41, t50, t51, t80 ],
  [ t00, t32, t73, t37, t43, t61, t82 ],
  [ t00, t00, t00, t00, t00, t27, t00 ],
]
const twig = [
  [ t01 ],
  [ t27 ],
]

// create random underground texture
for (let i = -30; i < 158; i++) {
  fg.unshift({ x: i, y: 119, tile: random(undergroundTiles) })
}

// create random grass
for (let i = 0; i < 128; i++) {
  fg.unshift({ x: i, y: 118, tile: random(grassTiles) })
}

// parallax = parallax.concat(parsePattern(bgStart, 4, 106))
// parallax = parallax.concat(parsePattern(randomBg(), 8, 106))

parallax = parallax.concat(parsePattern(bigTree1, 2, 106))
parallax = parallax.concat(parsePattern(bigTree2, 14, 106))
parallax = parallax.concat(parsePattern(bigTree1, 19, 107))
parallax = parallax.concat(parsePattern(bigTree1, 26, 104))
parallax = parallax.concat(parsePattern(bigTree2, 32, 109))
parallax = parallax.concat(parsePattern(climbTree, 36, 109))
parallax = parallax.concat(parsePattern(bush, 41, 115))
parallax = parallax.concat(parsePattern(bigTree1, 40, 104))
parallax = parallax.concat(parsePattern(bigTree2, 45, 111))
parallax = parallax.concat(parsePattern(bigTree2, 49, 109))
parallax = parallax.concat(parsePattern(climbTree, 52, 110))

fg = fg.concat(parsePattern(groundUp, 29, 115))
fg = fg.concat(parsePattern(groundUp, 39, 113))
fg = fg.concat(parsePattern(fillArea([t10], 10, 4), 41, 116))
fg = fg.concat(parsePattern(fillArea([t05], 1, 1), 41, 116))
fg = fg.concat(parsePattern(fillArea([t06], 1, 1), 46, 116))
fg = fg.concat(parsePattern(fillArea(undergroundTiles, 4, 1), 42, 116))
fg = fg.concat(parsePattern(fillArea(grassTiles, 7, 1), 51, 113))
fg = fg.concat(parsePattern(fillArea([t05], 1, 1), 51, 114))
fg = fg.concat(parsePattern(fillArea([t06], 1, 1), 51, 115))
fg = fg.concat(parsePattern(fillArea([t06], 1, 1), 51, 115))
fg = fg.concat(parsePattern(fillArea(undergroundTiles, 6, 1), 52, 114))
bg = bg.concat(parsePattern(fillArea([t10], 13, 5), 51, 115))
fg = fg.concat(parsePattern(fillArea([t10], 11, 1), 61, 119))
bg = bg.concat(parsePattern(groundDownTwistBg, 58, 113))
fg = fg.concat(parsePattern(groundDownTwist, 58, 113))
fg = fg.concat(parsePattern(groundDown, 72, 113))

fg = fg.concat(parsePattern(stump, 5, 117))
fg = fg.concat(parsePattern(bigTree1, 7, 104))
fg = fg.concat(parsePattern(log, 15, 117))
bg = bg.concat(parsePattern(smallStone, 17, 118))
bg = bg.concat(parsePattern(stone, 20, 117))
fg = fg.concat(parsePattern(mushroom2, 25, 118))
bg = bg.concat(parsePattern(mushroom1, 29, 118))
bg = bg.concat(parsePattern(bigTree2, 14, 104))
bg = bg.concat(parsePattern(bigTree1, 22, 108))
fg = fg.concat(parsePattern(bigTree1, 24, 104))
bg = bg.concat(parsePattern(stoneMoss, 32, 116))
bg = bg.concat(parsePattern(smallStoneMoss, 34, 117))
bg = bg.concat(parsePattern(bigTree1, 34, 102))
bg = bg.concat(parsePattern(bigTree2, 38, 101))
fg = fg.concat(parsePattern(climbTree, 44, 104))
bg = bg.concat(parsePattern(bush, 50, 110))
fg = fg.concat(parsePattern(branches, 50, 110))
fg = fg.concat(parsePattern(mushroom1, 55, 118))
fg = fg.concat(parsePattern(mushroom3, 57, 118))
fg = fg.concat(parsePattern(mushroom4, 58, 118))
fg = fg.concat(parsePattern(mushroom5, 59, 118))
fg = fg.concat(parsePattern(branches, 57, 108))
bg = bg.concat(parsePattern(bigTree1, 61, 105))
fg = fg.concat(parsePattern(branches2, 63, 108))
bg = bg.concat(parsePattern(stoneMoss, 69, 113))
fg = fg.concat(parsePattern(stumpMoss, 70, 112))
fg = fg.concat(parsePattern(twig, 74, 112))
fg = fg.concat(parsePattern(branches, 75, 113))
bg = bg.concat(parsePattern(bigTree2, 73, 103))
bg = bg.concat(parsePattern(climbTree, 77, 109))
fg = fg.concat(parsePattern(bigTree1, 80, 104))
fg = fg.concat(parsePattern(branches2, 83, 115))
fg = fg.concat(parsePattern(climbTree, 89, 108))
fg = fg.concat(parsePattern(stone, 94, 117))
fg = fg.concat(parsePattern(smallStone, 96, 118))
fg = fg.concat(parsePattern(bigTree1, 94, 104))
fg = fg.concat(parsePattern(mushroom1, 101, 118))
fg = fg.concat(parsePattern(mushroom2, 104, 118))
fg = fg.concat(parsePattern(log, 105, 117))
fg = fg.concat(parsePattern(mushroom4, 105, 118))
fg = fg.concat(parsePattern(mushroom5, 107, 118))
bg = bg.concat(parsePattern(bigTree2, 101, 107))
bg = bg.concat(parsePattern(bigTree1, 107, 106))
bg = bg.concat(parsePattern(bush, 111, 115))

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


objects.push(new Bear(
  'bigBear',
  {
    x: 970,
    y: 1024 - constants.GROUNDHEIGHT - constants.MENU.h - 31
  }
))
export default {
  world: { w: 1000, h: 1024 },
  start: {
    city: { x: 20, y: 1024 - constants.GROUNDHEIGHT - constants.MENU.h - 33}
  },
  parallax: parallax.map(tile => mapTile(tile, tileSize)),
  bg: bg.map(tile => mapTile(tile, tileSize)),
  fg: fg.map(tile => mapTile(tile, tileSize)),
  objects,
  events,
  track: 'santaMaria'
}