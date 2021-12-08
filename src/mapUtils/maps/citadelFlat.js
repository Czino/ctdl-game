import stage from './stage/citadelFlat'

import { CTDLGAME } from '../../gameUtils'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import { makeBoundary } from '../../geometryUtils'
import getHitBoxes from '../getHitBoxes'
import Vic from '../../npcs/Vic'

import citadelFlat from '../../sprites/citadelFlat.png'
import vic from '../../sprites/vic.png'
import constants from '../../constants'
import darken from '../darken'

const worldWidth = 15
const worldHeight = 9

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

makeConsolidatedBoundary(0, 0, worldWidth, 1, tileSize)
makeConsolidatedBoundary(worldWidth, 0, 1, worldHeight, tileSize)
makeConsolidatedBoundary(0, 0, 1, worldHeight, tileSize)
makeConsolidatedBoundary(0, worldHeight, worldWidth, 1, tileSize)

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'citadel', tileSize))

// TODO add exit

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    citadel: { x: 5 * tileSize, y: 6 * tileSize - 4}
  },
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  objects,
  npcs: () => [
    new Vic(
      'vic',
      {
        x: 6 * tileSize,
        y: 0 * tileSize
      }
    )
  ],
  items: () => [],
  events,
  assets: {
    citadelFlat,
    vic
  },
  update: () => {
    const vic = CTDLGAME.objects.find(obj => obj.id === 'vic')
    constants.bgContext.drawImage(
      CTDLGAME.assets.citadelFlat,
      0, 0, worldWidth * tileSize, worldHeight * tileSize,
      0, 0, worldWidth * tileSize, worldHeight * tileSize
    )

    if (vic.status === 'sleep') darken(.90, .81, '#170705')
    if (vic.status === 'open') darken(.90 * (1 - vic.frame / 6), .81 * (1 - vic.frame / 6), '#170705')
    if (vic.status === 'close') darken(.90 * vic.frame / 6, .81 * vic.frame / 6, '#170705')
  },
  track: () => 'imperayritzDeLaCiutatIoyosa',
  canSetBlocks: false,
  overworld: false,
  spawnRates: {}
}