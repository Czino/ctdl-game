import stage from './stage/funeral'

import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import { makeBoundary } from '../../geometryUtils'
import { addTextToQueue } from '../../textUtils'
import getHitBoxes from '../getHitBoxes'
import parseLightSources from '../parseLightSources'
import GameObject from '../../GameObject'

import funeral from '../../sprites/funeral.png'

const worldWidth = 25
const worldHeight = 24
const tileSize = 8

stage.parallax = parsePattern(stage.parallax, 0, 0)
stage.bg = parsePattern(stage.bg, 0, 0)
stage.base = parsePattern(stage.base, 0, 0)
stage.fg = parsePattern(stage.fg, 0, 0)
const ramps = [].map(tile => tile.toString())
const solids = [].map(tile => tile.toString())
const spawnPoints = [].map(tile => tile.toString())
const lights = {
}
let lightSources = parseLightSources(lights, stage.fg, tileSize)
let touched = false
const backEvents = [
  [11, 18, 3, 6, () => {
    if (touched) return
    addTextToQueue('RIP American Hodl', () => touched = false)
    touched = true
  }]
]
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
makeConsolidatedBoundary(0, worldHeight, worldWidth, 1, tileSize)

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'funeral', tileSize))

backEvents.map(backEvent => {
  const event = new GameObject(`event-${backEvent[0]}-${backEvent[1]}`, {
    x: backEvent[0] * tileSize,
    y: backEvent[1] * tileSize,
    w: backEvent[2] * tileSize,
    h: backEvent[3] * tileSize,
  })
  event.backEvent = backEvent[4]
  events.push(event)
})

const goToCitadel = new GameObject('goToCitadel', {
  x: 1 * tileSize,
  y: 124 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})
goToCitadel.touchEvent = () => {
  changeMap('citadel', 'funeral')
}
events.push(goToCitadel)


export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    citadel: { x: 2 * tileSize, y: 21 * tileSize - 6 }
  },
  state: {},
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  lightSources,
  objects,
  npcs: () => [],
  items: () => [],
  events,
  assets: {
    funeral,
  },
  track: () => 'funeral',
  spawnRates: {}
}
