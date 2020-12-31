import stage from './stage/forest'

import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import { makeBoundary } from '../../geometryUtils'
import Bear from '../../enemies/Bear'
import NPC from '../../npcs/NPC'
import { CTDLGAME } from '../../gameUtils'
import getHitBoxes from '../getHitBoxes'

import forest from '../../sprites/forest.png'
import rabbit from '../../sprites/rabbit.png'
import goldbugs from '../../sprites/goldbugs.png'
import bear from '../../sprites/bear.png'
import moon from '../../sprites/moon.png'

const worldWidth = 256
const worldHeight = 128
const tileSize = 8

stage.parallax = parsePattern(stage.parallax, 0, 0)
stage.bg = parsePattern(stage.bg, 0, 0)
stage.base = parsePattern(stage.base, 0, 0)
stage.fg = parsePattern(stage.fg, 0, 0)

const ramps = [
  [2, 0], [3, 4], [4, 0], [5, 0], [6, 0], [7, 0], [7, 1],
  [0, 1], [1, 1],
  [0, 2], [1, 2],
  [0, 3], [1, 3],
  [2, 6], [3, 6],
  [2, 7], [3, 7],
  [5, 9], [6, 9], [5, 10], [6, 10],
  [7, 6], [8, 6]
].map(tile => tile.toString())
const solids = [
  [0, 4], [1, 4],
  [0, 5], [1, 5], [2, 5], [3, 5],
  [0, 6], [1, 6],
  [1, 0], [1, 4],
  [4, 1], [5, 1], [6, 1],
  [4, 2], [5, 2], [6, 2], [7, 2],
  [7, 7], [8, 7], [7, 8], [8, 8]
].map(tile => tile.toString())
const spawnPoints = [
  [0, 1], [1, 1],
  [2, 6], [3, 6]
].map(tile => tile.toString())
let events = []
let objects = []

const rabbitHole = [
  [ [0, 5] ],
  [ [5, 8] ],
  [ [6, 8] ],
  [ [6, 8] ],
  [ [5, 8] ],
  [ [6, 8] ],
  [ [6, 8] ]
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
makeConsolidatedBoundary(0, 0, 1, worldHeight, tileSize)

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'forest', tileSize))

const gotToCity = new GameObject('gotToCity', {
  x: 1 * tileSize,
  y: 124 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

gotToCity.touchEvent = () => {
  changeMap('city', 'forest')
}
events.push(gotToCity)

const rabbitHoleStart = new GameObject('rabbitHoleStart', {
  x: 63 * tileSize,
  y: 122 * tileSize,
  w: 2 * tileSize,
  h: tileSize,
})

let rabbitHoleStarted = false
rabbitHoleStart.touchEvent = () => {
  if (rabbitHoleStarted) return

  rabbitHoleStarted = true
  CTDLGAME.world.map.bg = CTDLGAME.world.map.bg.concat(
    parsePattern(rabbitHole, 63, 122).map(tile => mapTile(tile, tileSize))
  )
}
events.push(rabbitHoleStart)

const goToRabbitHole = new GameObject('goToRabbitHole', {
  x: 63 * tileSize,
  y: 126 * tileSize,
  w: 3 * tileSize,
  h: 2 * tileSize,
})

goToRabbitHole.touchEvent = () => {
  changeMap('rabbitHole', 'forest')
}
events.push(goToRabbitHole)

const goToMtGox = new GameObject('goToMtGox', {
  x: 254 * tileSize,
  y: 96 * tileSize,
  w: 1 * tileSize,
  h: 3 * tileSize,
})

goToMtGox.touchEvent = () => {
  changeMap('mtGox', 'forest')
}
events.push(goToMtGox)

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    conbase: { x: 4 * tileSize, y: 124 * tileSize - 6 },
    mtGox: { x: 251 * tileSize, y: 96 * tileSize }
  },
  state: {},
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  objects,
  npcs: () => [
    new NPC(
      'monk',
      {
        x: 42 * tileSize + 3,
        y: 124 * tileSize + 1
      }
    ),
    new NPC(
      'leprikon',
      {
        x: 89 * tileSize,
        y: 124 * tileSize
      }
    ),
    new Bear(
      'bigBear',
      {
        x: 190 * tileSize,
        y: 107 * tileSize
      }
    ),
    new NPC(
      'elon',
      {
        x: 238 * tileSize,
        y: 99 * tileSize - 3
      }
    )
  ],
  items: () => [],
  events,
  assets: {
    forest,
    rabbit,
    goldbugs,
    bear,
    moon
  },
  track: () => 'santaMaria',
  overworld: true,
  spawnRates: {
    rabbit: .005,
    goldbugs: .005
  }
}