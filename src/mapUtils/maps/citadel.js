import stage from './stage/citadel'

import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import BitcoinLabrador from '../../npcs/BitcoinLabrador'
import { makeBoundary } from '../../geometryUtils'
import getHitBoxes from '../getHitBoxes'

import citadel from '../../sprites/citadel.png'
import nakadaiMonarch from '../../sprites/nakadaiMonarch.png'
import bitcoinLabrador from '../../sprites/bitcoinLabrador.png'
import blockchain from '../../sprites/blockchain.png'
import moon from '../../sprites/moon.png'

const worldWidth = 20
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

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'citadel', tileSize))

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    citadelBeach: { x: 5 * tileSize, y: 124 * tileSize - 4}
  },
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  objects,
  npcs: () => [
    new BitcoinLabrador(
      'bitcoinLabrador',
      {
        x: 6 * tileSize,
        y: 123 * tileSize + 3
      }
    )
  ],
  items: () => [],
  events,
  assets: {
    citadel,
    nakadaiMonarch,
    bitcoinLabrador,
    blockchain,
    moon
  },
  track: () => 'imperayritzDeLaCiutatIoyosa',
  canSetBlocks: false,
  overworld: true,
  spawnRates: {
    blockchain: .01
  }
}