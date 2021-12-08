import stage from './stage/city'

import { CTDLGAME } from '../../gameUtils'
import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import NPC from '../../npcs/NPC'
import { addTextToQueue, setTextQueue } from '../../textUtils'
import { makeBoundary } from '../../geometryUtils'
import getHitBoxes from '../getHitBoxes'

import city from '../../sprites/city.png'
import wizard from '../../sprites/wizard.png'
import explosion from '../../sprites/explosion.png'
import shitcoiner from '../../sprites/shitcoiner.png'
import moon from '../../sprites/moon.png'

const worldWidth = 128
const worldHeight = 128

const tileSize = 8

stage.parallax = parsePattern(stage.parallax, 0, 0)
stage.bg = parsePattern(stage.bg, 0, 0)
stage.base = parsePattern(stage.base, 0, 0)
stage.fg = parsePattern(stage.fg, 0, 0)
const ramps = [
  [4, 1], [5, 1]
].map(tile => tile.toString())
const solids = [
  [1, 0],
  [0, 1], [1, 1], [2, 1], [6, 1], [7, 1],
  [0, 2], [1, 2], [2, 2], [3, 2], [6, 2], [7, 2],
  [0, 3], [1, 3], [2, 3], [3, 3],
  [0, 4], [1, 4], [2, 4], [3, 4],
  [0, 5], [1, 5], [2, 5], [3, 5],
  [0, 6], [1, 6], [2, 6], [3, 6], [7, 6],
  [0, 7], [1, 7], [2, 7], [3, 7], [7, 7],
  [0, 8], [1, 8], [2, 8],
  [0, 9], [1, 9], [2, 9],
  [0, 10], [1, 10], [2, 10],
].map(tile => tile.toString())
const spawnPoints = [
  [0, 1], [1, 1], [2, 1]
].map(tile => tile.toString())

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

const goToShop = new GameObject('goToShop', {
  x: 79 * tileSize,
  y: 122 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

goToShop.backEvent = character => {
  CTDLGAME.menuItem = 0
  CTDLGAME.showShop = character
}

const goToBuilding1 = new GameObject('goToBuilding1', {
  x: 30 * tileSize,
  y: 124 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

goToBuilding1.backEvent = () => {
  changeMap('building', 'city')
}


const goToBuilding2 = new GameObject('goToBuilding2', {
  x: 87 * tileSize,
  y: 122 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

goToBuilding2.backEvent = () => {
  setTextQueue([])
  addTextToQueue('Something seems to be\nblocking the entry\nto the building')
}

const gotToConbase = new GameObject('gotToConbase', {
  x: 126 * tileSize,
  y: 122 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

gotToConbase.touchEvent = () => {
  changeMap('conbase', 'city')
}


events.push(goToShop)
events.push(goToBuilding1)
events.push(goToBuilding2)
events.push(gotToConbase)

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'city', tileSize))


export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    building: { x: 30 * tileSize, y: 124 * tileSize - 4},
    building2: { x: 87 * tileSize, y: 122 * tileSize },
    mempool: { x: 58 * tileSize, y: 119 * tileSize },
    conbase: { x: 122 * tileSize, y: 122 * tileSize }
  },
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  objects,
  npcs: () => [
    new NPC(
      'mirco',
      {
        x: 34 * tileSize,
        y: 123 * tileSize + 3
      }
    ),
    new NPC(
      'dave',
      {
        x: 77 * tileSize,
        y: 123 * tileSize + 3
      }
    ),
    new NPC(
      'peter',
      {
        x: 89 * tileSize,
        y: 122 * tileSize + 1
      }
    )
  ],
  items: () => [],
  events,
  assets: {
    city,
    wizard,
    explosion,
    shitcoiner,
    moon
  },
  track: () => 'imperayritzDeLaCiutatIoyosa',
  canSetBlocks: false,
  overworld: true,
  spawnRates: {
    shitcoiner: .005
  }
}