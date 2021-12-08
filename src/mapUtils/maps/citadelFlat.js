import stage from './stage/citadelFlat'

import { CTDLGAME } from '../../gameUtils'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import { makeBoundary } from '../../geometryUtils'
import getHitBoxes from '../getHitBoxes'

import citadelOffice from '../../sprites/citadelOffice.png'
import bottle from '../../sprites/bottle.png'
import constants from '../../constants'
import Czino from '../../npcs/Czino'
import Cat from '../../npcs/Cat'
import czino from '../../sprites/czino.png'
import crispy from '../../sprites/crispy.png'
import pita from '../../sprites/pita.png'

const worldWidth = 15
const worldHeight = 10

const tileSize = 8

stage.parallax = parsePattern(stage.parallax, 0, 0)
stage.bg = parsePattern(stage.bg, 0, 0)
stage.base = parsePattern(stage.base, 0, 0)
stage.fg = parsePattern(stage.fg, 0, 0)
const ramps = [].map(tile => tile.toString())
const solids = [].map(tile => tile.toString())
const spawnPoints = [].map(tile => tile.toString())

let objects = []
let events = []


// TODO call Boundary directly?
const makeConsolidatedBoundary = (x, y, w, h, tileSize) => {
  objects.push(makeBoundary({
    x: x * tileSize,
    y: y * tileSize,
    w: w * tileSize,
    h: h * tileSize,
  }))
}

makeConsolidatedBoundary(0, 0, 1, worldHeight, tileSize)
makeConsolidatedBoundary(worldWidth, 0, 1, worldHeight, tileSize)
makeConsolidatedBoundary(0, worldHeight - 1, worldWidth, 1, tileSize)

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'citadel', tileSize))

// TODO add exit

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    citadel: { x: 5 * tileSize, y: 4 * tileSize - 4}
  },
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  objects,
  npcs: () => [
    new Czino('czino',
      {
        x: 6 * tileSize,
        y: 4 * tileSize -4
      }
    ),
    new Cat('crispy',
      {
        spriteId: 'crispy',
        x: 6 * tileSize,
        y: 4 * tileSize -4
      }
    ),
    new Cat('pita',
      {
        spriteId: 'pita',
        x: 9 * tileSize,
        y: 4 * tileSize -4
      }
    )
  ],
  items: () => [],
  events,
  assets: {
    citadelOffice,
    bottle,
    czino,
    crispy,
    pita,
  },
  update: () => {
    constants.bgContext.drawImage(
      CTDLGAME.assets.citadelOffice,
      0, 0, worldWidth * tileSize, worldHeight * tileSize,
      0, 0, worldWidth * tileSize, worldHeight * tileSize
    )
    constants.fgContext.drawImage(
      CTDLGAME.assets.bottle,
      0, 0, worldWidth * tileSize, worldHeight * tileSize,
      0, 0, worldWidth * tileSize, worldHeight * tileSize
    )
  },
  track: () => 'imperayritzDeLaCiutatIoyosa',
  canSetBlocks: false,
  overworld: false,
  spawnRates: {}
}