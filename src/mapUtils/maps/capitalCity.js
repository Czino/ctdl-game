import stage from './stage/capitalCity'

import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import { CTDLGAME } from '../../gameUtils'
import Brian from '../../enemies/Brian'
import NPC from '../../npcs/NPC'
import { addTextToQueue, setTextQueue } from '../../textUtils'
import { makeBoundary } from '../../geometryUtils'
import getHitBoxes from '../getHitBoxes'

import capitalCity from '../../sprites/capitalCity.png'
import moon from '../../sprites/moon.png'

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
  canSetBlocks: false,
  overworld: true,
  spawnRates: {
    // shitcoiner: .01
  }
}