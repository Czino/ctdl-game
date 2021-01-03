import stage from './stage/grasslands'

import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import { makeBoundary } from '../../geometryUtils'
import getHitBoxes from '../getHitBoxes'

import grasslands from '../../sprites/grasslands.png'
import bull from '../../sprites/bull.png'
import moon from '../../sprites/moon.png'
import shitcoiner from '../../sprites/shitcoiner.png'
import bagholder from '../../sprites/bagholder.png'
import constants from '../../constants'
import { CTDLGAME } from '../../gameUtils'

const worldWidth = 128
const worldHeight = 64

const tileSize = 8

stage.parallax = parsePattern(stage.parallax, 0, 0)
stage.bg = parsePattern(stage.bg, 0, 0)
stage.base = parsePattern(stage.base, 0, 0)
stage.fg = parsePattern(stage.fg, 0, 0)
const ramps = [
  [0, 1], [1, 1], [2, 1]
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


const goToForest = new GameObject('goToForest', {
  x: 2 * tileSize,
  y: 60 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})
goToForest.touchEvent = () => {
  changeMap('forest', 'grasslands')
}
events.push(goToForest)



const bullrunSeen = new GameObject('bullrunSeen', {
  x: 6 * tileSize,
  y: 60 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})
bullrunSeen.touchEvent = () => {
  CTDLGAME.world.map.state.bullrunSeen = true
}
events.push(bullrunSeen)

const goToMtGox = new GameObject('goToMtGox', {
  x: 127 * tileSize,
  y: 60 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})
goToMtGox.touchEvent = () => {
  changeMap('mtGox', 'grasslands')
}
events.push(goToMtGox)


objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'grasslands', tileSize))

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    forest: { x: 5 * tileSize, y: 59 * tileSize + 1 },
    mtGox: { x: 124 * tileSize, y: 59 * tileSize + 1 }
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
  ],
  items: () => [],
  events,
  assets: {
    grasslands,
    bull,
    shitcoiner,
    bagholder,
    moon
  },
  init: () => {
    if (CTDLGAME.world.map.state.bullrunSeen) {
      CTDLGAME.world.map.state.bullrun = false
    }
    CTDLGAME.world.map.overworld = !CTDLGAME.world.map.state.bullrun
    if (!CTDLGAME.world.map.state.bullrun) {
      CTDLGAME.objects
        .filter(obj => obj.class === 'Bull')
        .map(obj => obj.remove = true)
      CTDLGAME.world.map.spawnRates.bull = 0
      CTDLGAME.world.map.spawnRates.shitcoiner = 0.01
      CTDLGAME.world.map.spawnRates.bagholder = 0.005
    }
  },
  update: () => {
    if (!CTDLGAME.world.map.state.bullrun) return
    let gradient = constants.skyContext.createLinearGradient(
      CTDLGAME.viewport.x, CTDLGAME.viewport.y,
      CTDLGAME.viewport.x, CTDLGAME.viewport.y + constants.HEIGHT
    )
    gradient.addColorStop(0, '#65090c')
    gradient.addColorStop(1, '#f9e46c')

    constants.skyContext.fillStyle = gradient
    constants.skyContext.fillRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
  },
  track: () => 'aNewHope',
  canSetBlocks: false,
  overworld: false,
  spawnRates: {
    bull: .421,
    shitcoiner: 0,
    bagholder: 0
  }
}