import stage from './stage/building'

import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import { makeBoundary } from '../../geometryUtils'
import getHitBoxes from '../getHitBoxes'

import building from '../../sprites/building.png'
const worldWidth = 128
const worldHeight = 128
const tileSize = 8

stage.parallax = parsePattern(stage.parallax, 0, 0)
stage.bg = parsePattern(stage.bg, 0, 0)
stage.base = parsePattern(stage.base, 0, 0)
stage.fg = parsePattern(stage.fg, 0, 0)
const ramps = [
  [0, 4], [1, 4]
].map(tile => tile.toString())
const solids = [
  [1, 0],
  [0, 1], [1, 1], [2, 1], [3, 1],
  [2, 2],
  [2, 3],
  [0, 5], [1, 5]
].map(tile => tile.toString())
const spawnPoints = []

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

makeConsolidatedBoundary(0, 0, worldWidth, 1, tileSize)
makeConsolidatedBoundary(worldWidth, 0, 1, worldHeight, tileSize)
makeConsolidatedBoundary(0, 0, 1, worldHeight, tileSize)

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'building', tileSize))

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

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    city: { x: 5 * tileSize, y: 48 * tileSize - 2 }
  },
  state: {},
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
  assets: {
    building
  },
  track: () => 'imperayritzDeLaCiutatIoyosa',
  bgColor: () => '#212121',
  update: () => {},
  spawnRates: {}
}