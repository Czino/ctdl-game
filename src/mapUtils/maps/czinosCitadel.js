import stage from './stage/czinosCitadel'

import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import { makeBoundary } from '../../geometryUtils'
import getHitBoxes from '../getHitBoxes'
import Czino from '../../npcs/Czino'
import Luma from '../../npcs/Luma'
import Cat from '../../npcs/Cat'

import czinosCitadel from '../../sprites/czinosCitadel.png'
import czino from '../../sprites/czino.png'
import luma from '../../sprites/luma.png'
import crispy from '../../sprites/crispy.png'
import pita from '../../sprites/pita.png'
import moon from '../../sprites/moon.png'

const worldWidth = 64
const worldHeight = 64
const tileSize = 8

stage.parallax = parsePattern(stage.parallax, 0, 0)
stage.bg = parsePattern(stage.bg, 0, 0)
stage.base = parsePattern(stage.base, 0, 0)
stage.fg = parsePattern(stage.fg, 0, 0)
const ramps = [
  [0, 1],[1, 1], [2, 1],
  [0, 2], [1, 2],
  [0, 3], [1, 3]
].map(tile => tile.toString())
const solids = [
  [1, 0], [0, 4], [1, 4]
].map(tile => tile.toString())
const spawnPoints = [
  [0, 1], [1, 1], [2, 1],
  [1, 0], [0, 4], [1, 4]
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
  x: 62 * tileSize,
  y: 57 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})
goToGrasslands.touchEvent = () => {
  changeMap('grasslands', 'czinosCitadel')
}
events.push(goToGrasslands)


objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'czinosCitadel', tileSize))

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    grasslands: { x: 59 * tileSize, y: 57 * tileSize + 1 }
  },
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  state: {
    bullrun: true
  },
  objects,
  npcs: () => [
    new Czino('czino',
      {
        x: 20 * tileSize,
        y: 59 * tileSize + 1
      }
    ),
    new Luma('luma',
      {
        x: 48 * tileSize,
        y: 59 * tileSize + 1
      }
    ),
    new Cat('crispy',
      {
        spriteId: 'crispy',
        x: 52 * tileSize,
        y: 59 * tileSize + 1
      }
    ),
    new Cat('pita',
      {
        spriteId: 'pita',
        x: 51 * tileSize,
        y: 59 * tileSize + 1
      }
    )
  ],
  items: () => [],
  events,
  assets: {
    czinosCitadel,
    czino,
    luma,
    crispy,
    pita,
    moon
  },
  track: () => 'aNewHope',
  canSetBlocks: false,
  overworld: true,
  spawnRates: {}
}