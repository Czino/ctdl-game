import stage from './stage/funeral'

import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import { makeBoundary } from '../../geometryUtils'
import { addTextToQueue } from '../../textUtils'
import getHitBoxes from '../getHitBoxes'
import parseLightSources from '../parseLightSources'
import GameObject from '../../GameObject'
import AmericanHodl from '../../npcs/AmericanHodl'
import MrsAmericanHodl from '../../npcs/MrsAmericanHodl'
import Vlad from '../../npcs/Vlad'
import GlennHodl from '../../npcs/GlennHodl'
import ChrisWhodl from '../../npcs/ChrisWhodl'

import funeral from '../../sprites/funeral.png'
import americanHodl from '../../sprites/americanHodl.png'
import mrsAmericanHodl from '../../sprites/mrsAmericanHodl.png'
import vlad from '../../sprites/vlad.png'
import glennHodl from '../../sprites/glennHodl.png'
import chrisWhodl from '../../sprites/chrisWhodl.png'

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
    addTextToQueue('      American Hodl 21 \n       April 18th 2021 \n      Beloved Husband \n       and shitposter ', () => touched = false)
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
  npcs: () => [
    new MrsAmericanHodl('mrsAmericanHodl', {
      x: 16 * tileSize,
      y: 19 * tileSize -4,
      context: 'bgContext'
    }),
    new AmericanHodl('americanHodl', {
      x: 17 * tileSize,
      y: 19 * tileSize - 4,
      context: 'bgContext'
    }),
    new Vlad('vlad-funeral', {
      x: 17 * tileSize,
      y: 20 * tileSize - 2,
      status: 'idle',
      direction: 'left'
    }),
    new ChrisWhodl('chrisWhodl-funeral', {
      x: 5 * tileSize,
      y: 20 * tileSize - 2,
      status: 'idle',
      direction: 'right'
    }),
    new GlennHodl('glennHodl-funeral', {
      x: 6 * tileSize,
      y: 20 * tileSize - 2,
      status: 'idle',
      direction: 'right'
    })
  ],
  items: () => [],
  events,
  assets: {
    funeral,
    americanHodl,
    mrsAmericanHodl,
    vlad,
    glennHodl,
    chrisWhodl
  },
  track: () => 'funeral',
  spawnRates: {}
}
