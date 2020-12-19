import stage from './stage/capitalCity'

import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import { CTDLGAME, getTimeOfDay } from '../../gameUtils'
import Brian from '../../enemies/Brian'
import NPC from '../../npcs/NPC'
import { addTextToQueue, setTextQueue } from '../../textUtils'
import { easeInOut, makeBoundary } from '../../geometryUtils'
import getHitBoxes from '../getHitBoxes'

import capitalCity from '../../sprites/capitalCity.png'
import moon from '../../sprites/moon.png'
import darken from '../darken'
import drawLightSources from '../drawLightSources'
import parseLightSources from '../parseLightSources'

const worldWidth = 256
const worldHeight = 128
const tileSize = 8

stage.parallax = parsePattern(stage.parallax, 0, 0)
stage.bg = parsePattern(stage.bg, 0, 0)
stage.base = parsePattern(stage.base, 0, 0)
stage.fg = parsePattern(stage.fg, 0, 0)
const ramps = [
  [0, 1], [1, 1]
].map(tile => tile.toString())
const solids = [
  [1, 0],
  [0, 2], [1, 2]
].map(tile => tile.toString())
const spawnPoints = []
const lights = {
  '6_8': {
    color: '#ebca09',
    brightness: .4,
    radius: 128
  }
}
let lightSources = parseLightSources(lights, stage.fg, tileSize)

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

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'capitalCity', tileSize))

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    mtGox: { x: 8 * tileSize, y: 124 * tileSize - 2}
  },
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  lightSources,
  objects,
  npcs: () => [
  ],
  items: () => [],
  events,
  assets: {
    capitalCity,
    moon
  },
  track: () => 'aNewHope',
  update: () => {
    let timeOfDay = getTimeOfDay()
    let y = timeOfDay < 4 || timeOfDay > 20 ? 1 : 0

    if (timeOfDay >= 4 && timeOfDay <= 6) {
      y = 1 - easeInOut((4 - timeOfDay) / -2, 3)
    } else if (timeOfDay >= 17 && timeOfDay <= 20) {
      y = easeInOut((timeOfDay - 17) / 3, 3)
    }
    if (y > 0) {
      darken(y / 2, y / 2, '#212121')
      drawLightSources(lightSources, 'capitalCity', tileSize, y)
    }
  },
  canSetBlocks: false,
  overworld: true,
  spawnRates: {
    // shitcoiner: .01
  }
}