import stage from './stage/cityUnderground'

import constants from '../../constants'
import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import { CTDLGAME, getTimeOfDay } from '../../gameUtils'
import { addTextToQueue, setTextQueue } from '../../textUtils'
import { easeInOut, makeBoundary } from '../../geometryUtils'
import getHitBoxes from '../getHitBoxes'
import darken from '../darken'
import drawLightSources from '../drawLightSources'
import parseLightSources from '../parseLightSources'
import Citizen from '../../npcs/Citizen'
import Prophetoshi from '../../npcs/Prophetoshi'
import PoliceForce from '../../enemies/PoliceForce'
import Car from '../../objects/Car'

import cityUnderground from '../../sprites/cityUnderground.png'
import lagarde from '../../sprites/lagarde.png'
import Lagarde from '../../enemies/Lagarde'

const worldWidth = 128
const worldHeight = 64
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
const spawnPoints = [
  [0, 1], [1, 1]
].map(tile => tile.toString())
const lights = {
  '6_8': {
    color: '#ebca09',
    brightness: .4,
    radius: 128
  }
}
const doors = [
  [3, 124],
  [30, 124],
  [44, 124, character => { CTDLGAME.showShop = character}],
  [113, 124],
  [216, 124],
  [229, 124],
  [251, 124],
]
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

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'cityUnderground', tileSize))

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    capitalCity: { x: 8 * tileSize, y: 60 * tileSize - 6 }
  },
  state: {},
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  lightSources,
  objects,
  npcs: () => [
    new Lagarde(
      'lagarde',
      {
          x: 170,
          y: 60 * tileSize - 4,
          status: 'normal',
          direction: 'left'
      }
    )
  ],
  items: () => [],
  events,
  assets: {
    cityUnderground,
    lagarde
  },
  track: () => 'underground',
  canSetBlocks: false,
  overworld: false,
  spawnRates: {}
}
