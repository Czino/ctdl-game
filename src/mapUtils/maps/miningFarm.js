import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import constants from '../../constants'
import { makeBoundary } from '../../geometryUtils'
import { CTDLGAME } from '../../gameUtils'
import getHitBoxes from '../getHitBoxes'
import PoliceForce from '../../enemies/PoliceForce'
import { initSoundtrack } from '../../soundtrack'

const worldWidth = 128
const worldHeight = 16
const tileSize = 8
const t_0_0 = [0, 0], t_0_1 = [0, 1], t_0_2 = [0, 2], t_0_3 = [0, 3], t_0_4 = [0, 4], t_0_5 = [0, 5], t_0_6 = [0, 6], t_0_7 = [0, 7], t_0_8 = [0, 8], t_0_9 = [0, 9], t_0_10 = [0, 10],
  t_1_0 = [1, 0], t_1_1 = [1, 1], t_1_2 = [1, 2], t_1_3 = [1, 3], t_1_4 = [1, 4], t_1_5 = [1, 5], t_1_6 = [1, 6], t_1_7 = [1, 7], t_1_8 = [1, 8], t_1_9 = [1, 9], t_1_10 = [1, 10],
  t_2_0 = [2, 0], t_2_1 = [2, 1], t_2_2 = [2, 2], t_2_3 = [2, 3], t_2_4 = [2, 4], t_2_5 = [2, 5], t_2_6 = [2, 6], t_2_7 = [2, 7], t_2_8 = [2, 8], t_2_9 = [2, 9], t_2_10 = [2, 10],
  t_3_0 = [3, 0], t_3_1 = [3, 1], t_3_2 = [3, 2], t_3_3 = [3, 3], t_3_4 = [3, 4], t_3_5 = [3, 5], t_3_6 = [3, 6], t_3_7 = [3, 7], t_3_8 = [3, 8], t_3_9 = [3, 9], t_3_10 = [3, 10],
  t_4_0 = [4, 0], t_4_1 = [4, 1], t_4_2 = [4, 2], t_4_3 = [4, 3], t_4_4 = [4, 4], t_4_5 = [4, 5], t_4_6 = [4, 6], t_4_7 = [4, 7], t_4_8 = [4, 8], t_4_9 = [4, 9], t_4_10 = [4, 10],
  t_5_0 = [5, 0], t_5_1 = [5, 1], t_5_2 = [5, 2], t_5_3 = [5, 3], t_5_4 = [5, 4], t_5_5 = [5, 5], t_5_6 = [5, 6], t_5_7 = [5, 7], t_5_8 = [5, 8], t_5_9 = [5, 9], t_5_10 = [5, 10],
  t_6_0 = [6, 0], t_6_1 = [6, 1], t_6_2 = [6, 2], t_6_3 = [6, 3], t_6_4 = [6, 4], t_6_5 = [6, 5], t_6_6 = [6, 6], t_6_7 = [6, 7], t_6_8 = [6, 8], t_6_9 = [6, 9], t_6_10 = [6, 10],
  t_7_0 = [7, 0], t_7_1 = [7, 1], t_7_2 = [7, 2], t_7_3 = [7, 3], t_7_4 = [7, 4], t_7_5 = [7, 5], t_7_6 = [7, 6], t_7_7 = [7, 7], t_7_8 = [7, 8], t_7_9 = [7, 9], t_7_10 = [7, 10],
  t_8_0 = [8, 0], t_8_1 = [8, 1], t_8_2 = [8, 2], t_8_3 = [8, 3], t_8_4 = [8, 4], t_8_5 = [8, 5], t_8_6 = [8, 6], t_8_7 = [8, 7], t_8_8 = [8, 8], t_8_9 = [8, 9], t_8_10 = [8, 10]

const stage = {
  "parallax": [[]],
  "bg": [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [t_0_0, t_1_0, t_2_0, t_3_0, t_4_0, t_5_0, t_6_0, t_7_0, t_0_0, t_1_0, t_2_0, t_3_0, t_4_0, t_5_0, t_6_0, t_7_0, t_0_0, t_1_0, t_2_0, t_3_0, t_4_0, t_5_0, t_6_0, t_7_0, t_0_0, t_1_0, t_2_0, t_3_0, t_4_0, t_5_0, t_6_0, t_7_0, t_0_0, t_1_0, t_2_0, t_3_0, t_4_0, t_5_0, t_6_0, t_7_0, t_0_0, t_1_0, t_2_0, t_3_0, t_4_0, t_5_0, t_6_0, t_7_0, t_0_0, t_1_0, t_2_0, t_3_0, t_4_0, t_5_0, t_6_0, t_7_0, t_0_0, t_1_0, t_2_0, t_3_0, t_4_0, t_5_0, t_6_0, t_7_0, t_0_0, t_1_0, t_2_0, t_3_0, t_4_0, t_5_0, t_6_0, t_7_0, t_0_0, t_1_0, t_2_0, t_3_0, t_4_0, t_5_0, t_6_0, t_7_0, t_0_0, t_1_0, t_2_0, t_3_0, t_4_0, t_5_0, t_6_0, t_7_0, t_0_0, t_1_0, t_2_0, t_3_0, t_4_0, t_5_0, t_6_0, t_7_0, t_0_0, t_1_0, t_2_0, t_3_0, t_4_0, t_5_0, t_6_0, t_7_0, t_0_0, t_1_0, t_2_0, t_3_0, t_4_0, t_5_0, t_6_0, t_7_0, t_0_0, t_1_0, t_2_0, t_3_0, t_4_0, t_5_0, t_6_0, t_7_0, t_0_0, t_1_0, t_2_0, t_3_0, t_4_0, t_5_0, t_6_0, t_7_0],
    [t_0_1, t_1_1, t_2_1, t_3_1, t_4_1, t_5_1, t_6_1, t_7_1, t_0_1, t_1_1, t_2_1, t_3_1, t_4_1, t_5_1, t_6_1, t_7_1, t_0_1, t_1_1, t_2_1, t_3_1, t_4_1, t_5_1, t_6_1, t_7_1, t_0_1, t_1_1, t_2_1, t_3_1, t_4_1, t_5_1, t_6_1, t_7_1, t_0_1, t_1_1, t_2_1, t_3_1, t_4_1, t_5_1, t_6_1, t_7_1, t_0_1, t_1_1, t_2_1, t_3_1, t_4_1, t_5_1, t_6_1, t_7_1, t_0_1, t_1_1, t_2_1, t_3_1, t_4_1, t_5_1, t_6_1, t_7_1, t_0_1, t_1_1, t_2_1, t_3_1, t_4_1, t_5_1, t_6_1, t_7_1, t_0_1, t_1_1, t_2_1, t_3_1, t_4_1, t_5_1, t_6_1, t_7_1, t_0_1, t_1_1, t_2_1, t_3_1, t_4_1, t_5_1, t_6_1, t_7_1, t_0_1, t_1_1, t_2_1, t_3_1, t_4_1, t_5_1, t_6_1, t_7_1, t_0_1, t_1_1, t_2_1, t_3_1, t_4_1, t_5_1, t_6_1, t_7_1, t_0_1, t_1_1, t_2_1, t_3_1, t_4_1, t_5_1, t_6_1, t_7_1, t_0_1, t_1_1, t_2_1, t_3_1, t_4_1, t_5_1, t_6_1, t_7_1, t_0_1, t_1_1, t_2_1, t_3_1, t_4_1, t_5_1, t_6_1, t_7_1, t_0_1, t_1_1, t_2_1, t_3_1, t_4_1, t_5_1, t_6_1, t_7_1],
    [t_0_2, t_1_2, t_2_2, t_3_2, t_4_2, t_5_2, t_6_2, t_7_2, t_0_2, t_1_2, t_2_2, t_3_2, t_4_2, t_5_2, t_6_2, t_7_2, t_0_2, t_1_2, t_2_2, t_3_2, t_4_2, t_5_2, t_6_2, t_7_2, t_0_2, t_1_2, t_2_2, t_3_2, t_4_2, t_5_2, t_6_2, t_7_2, t_0_2, t_1_2, t_2_2, t_3_2, t_4_2, t_5_2, t_6_2, t_7_2, t_0_2, t_1_2, t_2_2, t_3_2, t_4_2, t_5_2, t_6_2, t_7_2, t_0_2, t_1_2, t_2_2, t_3_2, t_4_2, t_5_2, t_6_2, t_7_2, t_0_2, t_1_2, t_2_2, t_3_2, t_4_2, t_5_2, t_6_2, t_7_2, t_0_2, t_1_2, t_2_2, t_3_2, t_4_2, t_5_2, t_6_2, t_7_2, t_0_2, t_1_2, t_2_2, t_3_2, t_4_2, t_5_2, t_6_2, t_7_2, t_0_2, t_1_2, t_2_2, t_3_2, t_4_2, t_5_2, t_6_2, t_7_2, t_0_2, t_1_2, t_2_2, t_3_2, t_4_2, t_5_2, t_6_2, t_7_2, t_0_2, t_1_2, t_2_2, t_3_2, t_4_2, t_5_2, t_6_2, t_7_2, t_0_2, t_1_2, t_2_2, t_3_2, t_4_2, t_5_2, t_6_2, t_7_2, t_0_2, t_1_2, t_2_2, t_3_2, t_4_2, t_5_2, t_6_2, t_7_2, t_0_2, t_1_2, t_2_2, t_3_2, t_4_2, t_5_2, t_6_2, t_7_2],
    [t_0_3, t_1_3, t_2_3, t_3_3, t_4_3, t_5_3, t_6_3, t_7_3, t_0_3, t_1_3, t_2_3, t_3_3, t_4_3, t_5_3, t_6_3, t_7_3, t_0_3, t_1_3, t_2_3, t_3_3, t_4_3, t_5_3, t_6_3, t_7_3, t_0_3, t_1_3, t_2_3, t_3_3, t_4_3, t_5_3, t_6_3, t_7_3, t_0_3, t_1_3, t_2_3, t_3_3, t_4_3, t_5_3, t_6_3, t_7_3, t_0_3, t_1_3, t_2_3, t_3_3, t_4_3, t_5_3, t_6_3, t_7_3, t_0_3, t_1_3, t_2_3, t_3_3, t_4_3, t_5_3, t_6_3, t_7_3, t_0_3, t_1_3, t_2_3, t_3_3, t_4_3, t_5_3, t_6_3, t_7_3, t_0_3, t_1_3, t_2_3, t_3_3, t_4_3, t_5_3, t_6_3, t_7_3, t_0_3, t_1_3, t_2_3, t_3_3, t_4_3, t_5_3, t_6_3, t_7_3, t_0_3, t_1_3, t_2_3, t_3_3, t_4_3, t_5_3, t_6_3, t_7_3, t_0_3, t_1_3, t_2_3, t_3_3, t_4_3, t_5_3, t_6_3, t_7_3, t_0_3, t_1_3, t_2_3, t_3_3, t_4_3, t_5_3, t_6_3, t_7_3, t_0_3, t_1_3, t_2_3, t_3_3, t_4_3, t_5_3, t_6_3, t_7_3, t_0_3, t_1_3, t_2_3, t_3_3, t_4_3, t_5_3, t_6_3, t_7_3, t_0_3, t_1_3, t_2_3, t_3_3, t_4_3, t_5_3, t_6_3, t_7_3],
    [t_0_4, t_1_4, t_2_4, t_3_4, t_4_4, t_5_4, t_6_4, t_7_4, t_0_4, t_1_4, t_2_4, t_3_4, t_4_4, t_5_4, t_6_4, t_7_4, t_0_4, t_1_4, t_2_4, t_3_4, t_4_4, t_5_4, t_6_4, t_7_4, t_0_4, t_1_4, t_2_4, t_3_4, t_4_4, t_5_4, t_6_4, t_7_4, t_0_4, t_1_4, t_2_4, t_3_4, t_4_4, t_5_4, t_6_4, t_7_4, t_0_4, t_1_4, t_2_4, t_3_4, t_4_4, t_5_4, t_6_4, t_7_4, t_0_4, t_1_4, t_2_4, t_3_4, t_4_4, t_5_4, t_6_4, t_7_4, t_0_4, t_1_4, t_2_4, t_3_4, t_4_4, t_5_4, t_6_4, t_7_4, t_0_4, t_1_4, t_2_4, t_3_4, t_4_4, t_5_4, t_6_4, t_7_4, t_0_4, t_1_4, t_2_4, t_3_4, t_4_4, t_5_4, t_6_4, t_7_4, t_0_4, t_1_4, t_2_4, t_3_4, t_4_4, t_5_4, t_6_4, t_7_4, t_0_4, t_1_4, t_2_4, t_3_4, t_4_4, t_5_4, t_6_4, t_7_4, t_0_4, t_1_4, t_2_4, t_3_4, t_4_4, t_5_4, t_6_4, t_7_4, t_0_4, t_1_4, t_2_4, t_3_4, t_4_4, t_5_4, t_6_4, t_7_4, t_0_4, t_1_4, t_2_4, t_3_4, t_4_4, t_5_4, t_6_4, t_7_4, t_0_4, t_1_4, t_2_4, t_3_4, t_4_4, t_5_4, t_6_4, t_7_4],
    [t_0_5, t_1_5, t_2_5, t_3_5, t_4_5, t_5_5, t_6_5, t_7_5, t_0_5, t_1_5, t_2_5, t_3_5, t_4_5, t_5_5, t_6_5, t_7_5, t_0_5, t_1_5, t_2_5, t_3_5, t_4_5, t_5_5, t_6_5, t_7_5, t_0_5, t_1_5, t_2_5, t_3_5, t_4_5, t_5_5, t_6_5, t_7_5, t_0_5, t_1_5, t_2_5, t_3_5, t_4_5, t_5_5, t_6_5, t_7_5, t_0_5, t_1_5, t_2_5, t_3_5, t_4_5, t_5_5, t_6_5, t_7_5, t_0_5, t_1_5, t_2_5, t_3_5, t_4_5, t_5_5, t_6_5, t_7_5, t_0_5, t_1_5, t_2_5, t_3_5, t_4_5, t_5_5, t_6_5, t_7_5, t_0_5, t_1_5, t_2_5, t_3_5, t_4_5, t_5_5, t_6_5, t_7_5, t_0_5, t_1_5, t_2_5, t_3_5, t_4_5, t_5_5, t_6_5, t_7_5, t_0_5, t_1_5, t_2_5, t_3_5, t_4_5, t_5_5, t_6_5, t_7_5, t_0_5, t_1_5, t_2_5, t_3_5, t_4_5, t_5_5, t_6_5, t_7_5, t_0_5, t_1_5, t_2_5, t_3_5, t_4_5, t_5_5, t_6_5, t_7_5, t_0_5, t_1_5, t_2_5, t_3_5, t_4_5, t_5_5, t_6_5, t_7_5, t_0_5, t_1_5, t_2_5, t_3_5, t_4_5, t_5_5, t_6_5, t_7_5, t_0_5, t_1_5, t_2_5, t_3_5, t_4_5, t_5_5, t_6_5, t_7_5],
    [t_0_6, t_1_6, t_2_6, t_3_6, t_4_6, t_5_6, t_6_6, t_7_6, t_0_6, t_1_6, t_2_6, t_3_6, t_4_6, t_5_6, t_6_6, t_7_6, t_0_6, t_1_6, t_2_6, t_3_6, t_4_6, t_5_6, t_6_6, t_7_6, t_0_6, t_1_6, t_2_6, t_3_6, t_4_6, t_5_6, t_6_6, t_7_6, t_0_6, t_1_6, t_2_6, t_3_6, t_4_6, t_5_6, t_6_6, t_7_6, t_0_6, t_1_6, t_2_6, t_3_6, t_4_6, t_5_6, t_6_6, t_7_6, t_0_6, t_1_6, t_2_6, t_3_6, t_4_6, t_5_6, t_6_6, t_7_6, t_0_6, t_1_6, t_2_6, t_3_6, t_4_6, t_5_6, t_6_6, t_7_6, t_0_6, t_1_6, t_2_6, t_3_6, t_4_6, t_5_6, t_6_6, t_7_6, t_0_6, t_1_6, t_2_6, t_3_6, t_4_6, t_5_6, t_6_6, t_7_6, t_0_6, t_1_6, t_2_6, t_3_6, t_4_6, t_5_6, t_6_6, t_7_6, t_0_6, t_1_6, t_2_6, t_3_6, t_4_6, t_5_6, t_6_6, t_7_6, t_0_6, t_1_6, t_2_6, t_3_6, t_4_6, t_5_6, t_6_6, t_7_6, t_0_6, t_1_6, t_2_6, t_3_6, t_4_6, t_5_6, t_6_6, t_7_6, t_0_6, t_1_6, t_2_6, t_3_6, t_4_6, t_5_6, t_6_6, t_7_6, t_0_6, t_1_6, t_2_6, t_3_6, t_4_6, t_5_6, t_6_6, t_7_6]
  ],
  "base": [[]],
  "fg": [[]]
}
stage.parallax = parsePattern(stage.parallax, 0, 0)
stage.bg = parsePattern(stage.bg, 0, 0)
stage.base = parsePattern(stage.base, 0, 0)
stage.fg = parsePattern(stage.fg, 0, 0)
const ramps = []
const solids = [
  t_0_6, t_1_6, t_2_6, t_3_6, t_4_6, t_5_6, t_6_6, t_7_6
].map(tile => tile.toString())
const blinkingLights = [
  [1, 9], [10, 11],
  [1, 13], [10, 14],
  [1, 18], [10, 17],
  [1, 23], [10, 20],
  [1, 28], [10, 24],
  [1, 33], [10, 27],
  [1, 38], [10, 30],
  [1, 43], [10, 33], [10, 36], [10, 39],
  [60, 9], [53, 11],
  [60, 13], [53, 14],
  [60, 18], [53, 17],
  [60, 23], [53, 20],
  [60, 28], [53, 24],
  [60, 33], [53, 27],
  [60, 38], [53, 30],
  [60, 43], [53, 33], [53, 36], [53, 39]
]
const blinkingLightsBg = [
  [14, 13], [18, 15], [45, 15], [49, 13],
  [14, 15], [18, 18], [45, 18], [49, 15],
  [14, 17], [18, 22], [45, 22], [49, 17],
  [14, 21], [18, 24], [45, 24], [49, 21],
  [14, 23], [18, 26], [45, 26], [49, 23],
  [14, 25], [18, 28], [45, 28], [49, 25],
  [14, 27], [18, 30], [45, 30], [49, 27],
  [14, 30], [18, 32], [45, 32], [49, 30],
  [14, 33], [18, 35], [45, 35], [49, 33],
  [14, 36], [18, 37], [45, 37], [49, 36],
  [14, 39], [18, 39], [45, 39], [49, 39]
]
let events = []
let objects = []

const makeConsolidatedBoundary = (x, y, w, h, tileSize) => {
  objects.push(makeBoundary({
    x: x * tileSize,
    y: y * tileSize,
    w: w * tileSize,
    h: h * tileSize,
  }))
}

makeConsolidatedBoundary(0, worldHeight - 0.25, worldWidth, 3, tileSize)
makeConsolidatedBoundary(0, 0, worldWidth, 1, tileSize)
makeConsolidatedBoundary(worldWidth, 0, 1, worldHeight, tileSize)
makeConsolidatedBoundary(0, 0, 1, worldHeight, tileSize)

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, 'dogeCoinMine', tileSize))

// const goToRabbitHole = new GameObject('goToRabbitHole', {
//   x: 1 * tileSize,
//   y: 67 * tileSize,
//   w: tileSize,
//   h: 3 * tileSize,
// })

// goToRabbitHole.touchEvent = () => {
//   changeMap('rabbitHole', 'dogeCoinMine')
// }
// events.push(goToRabbitHole)
const underAttack = new GameObject('underAttack', {
  x: 1 * tileSize,
  y: 12 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

underAttack.touchEvent = () => {
  if (CTDLGAME.world.map.state.underAttack) return
  CTDLGAME.world.map.state.underAttack = true
  initSoundtrack(CTDLGAME.world.map.track())
  // CTDLGAME.objects.push(new PoliceForce(
  //   'test-force',
  //   {
  //     x: 90,
  //     y: 96,
  //     widthShield: Math.random() > .5
  //   }
  // ))
}

events.push(underAttack)

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    citadel: { x: 20, y: 96 }
  },
  state: {
    underAttack: false
  },
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  removeEnemy: stage.fg
    .filter(tile => tile.tile.toString() === '1,0')
    .map(tile => mapTile(tile, tileSize)),
  objects,
  npcs: () => [],
  items: () => [],
  events,
  track: () => CTDLGAME.world.map.state.underAttack ? 'citadelUnderAttack' : 'miningFarm',
  bgColor: () => '#020105',
  update: () => {
    [
      constants.gameContext,
      constants.charContext
    ].map(context => {
      context.globalAlpha = '.4'
      context.globalCompositeOperation = 'source-atop'
      context.fillStyle = '#0915b8'
      context.fillRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
      context.globalCompositeOperation = 'source-over'
      context.globalAlpha = '1'
    })

    for (let i = 0; i < 16; i++) {
      blinkingLights
        .filter(() => Math.random() > .9)
        .map(light => {
          constants.bgContext.fillStyle = '#010124'
          constants.bgContext.fillRect(light[0] + i * 64, light[1] + 74, 1, 1)
        })
      blinkingLightsBg
        .filter(() => Math.random() > .1)
        .map(light => {
          constants.bgContext.fillStyle = '#525baa'
          constants.bgContext.fillRect(light[0] + i * 64, light[1] + 74, 1, 1)
        })
    }

    if (CTDLGAME.world.map.state.underAttack) {
      constants.skyContext.globalAlpha = '.4'
      constants.skyContext.fillStyle = '#b80909'
      constants.skyContext.fillRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
      constants.skyContext.globalAlpha = '1'
      ;[
        constants.bgContext,
        constants.gameContext,
        constants.charContext
      ].map(context => {
        context.globalCompositeOperation = 'source-atop'
        context.globalAlpha = '.4'
        context.fillStyle = '#b80909'
        context.fillRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
        context.globalCompositeOperation = 'source-over'
        context.globalAlpha = '1'
      })
    }
  },
  spawnRates: {}
}