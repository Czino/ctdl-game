import stage from './stage/mtGox'

import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import { makeBoundary } from '../../geometryUtils'
import getHitBoxes from '../getHitBoxes'

import mtGox from '../../sprites/mtGox.png'
import moon from '../../sprites/moon.png'

const worldWidth = 128
const worldHeight = 128

const tileSize = 8

stage.parallax = parsePattern(stage.parallax, 0, 0)
stage.bg = parsePattern(stage.bg, 0, 0)
stage.base = parsePattern(stage.base, 0, 0)
stage.fg = parsePattern(stage.fg, 0, 0)
const ramps = [
  [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
  [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1],
  [1, 2], [6, 2],
  [0, 3], [1, 3],
  [0, 4], [1, 4], [7, 4], [8, 4],
  [0, 6], [1, 6],
  [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7],
  [5, 8], [7, 10]
].map(tile => tile.toString())
const solids = [
  [1, 0],
  [2, 2], [3, 2], [4, 2], [5, 2],
  [2, 3], [3, 3], [4, 3], [5, 3],
  [2, 4], [3, 4], [4, 4], [5, 4],
  [1, 5], [2, 5], [3, 5], [4, 5],
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8],
  [0, 9], [1, 9], [2, 9], [3, 9],
  [0, 10], [1, 10], [2, 10], [3, 10],
].map(tile => tile.toString())
const spawnPoints = [
  [0, 1], [1, 1],
  [0, 6], [1, 6]
].map(tile => tile.toString())

let objects = []
let events = []

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

const goToGrasslands = new GameObject('goToGrasslands', {
  x: 1 * tileSize,
  y: 124 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})
goToGrasslands.touchEvent = () => {
  changeMap('grasslands', 'mtGox')
}
events.push(goToGrasslands)

const goToDogeCoinMine = new GameObject('goToDogeCoinMine', {
  x: 84 * tileSize,
  y: 117 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})
goToDogeCoinMine.touchEvent = () => {
  changeMap('dogeCoinMine', 'mtGox')
}
events.push(goToDogeCoinMine)


// TODO add event for sign to read "capital city"
const goToCapitalCity = new GameObject('goToCapitalCity', {
  x: 127 * tileSize,
  y: 118 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})
goToCapitalCity.touchEvent = () => {
  changeMap('capitalCity', 'mtGox')
}
events.push(goToCapitalCity)

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'mtGox', tileSize))

objects.find(obj => obj.id === 'ramp-1_7-74_115').makeToggle(false)

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    grasslands: { x: 5 * tileSize, y: 124 * tileSize - 4 },
    dogeCoinMine: { x: 79 * tileSize, y: 114 * tileSize + 1 },
    capitalCity: { x: 124 * tileSize, y: 118 * tileSize + 1 }
  },
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  objects,
  npcs: () => [
  ],
  items: () => [],
  events,
  assets: {
    mtGox,
    moon
  },
  track: () => 'stellaSplendence',
  canSetBlocks: false,
  overworld: true,
  spawnRates: {
    // shitcoiner: .01
  }
}