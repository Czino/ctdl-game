import stage from './stage/endOfTheRabbitHole'

import { CTDLGAME } from '../../gameUtils'
import { changeMap } from '../changeMap'
import { darken } from '../darken'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import constants from '../../constants'
import { makeBoundary } from '../../geometryUtils'
import NPC from '../../npcs/NPC'
import drawLightSources from '../drawLightSources'
import parseLightSources from '../parseLightSources'
import getHitBoxes from '../getHitBoxes'

import endOfTheRabbitHole from '../../sprites/endOfTheRabbitHole.png'
import dancers from '../../sprites/dancers.png'

const worldWidth = 32
const worldHeight = 32
const tileSize = 8

stage.parallax = parsePattern(stage.parallax, 0, 0)
stage.bg = parsePattern(stage.bg, 0, 0)
stage.base = parsePattern(stage.base, 0, 0)
stage.fg = parsePattern(stage.fg, 0, 0)

const ramps = [
  [0, 1], [1, 1], [2, 1], [3, 1],
  [0, 2], [1, 2],
  [0, 3], [1, 3],
  [2, 5],
  [1, 9], [2, 9]
].map(tile => tile.toString())
const solids = [
  [0, 6], [1, 6], [2, 6], [3, 6],
  [0, 7], [3, 7],
  [0, 8], [3, 8],
  [0, 9], [3, 9],
  [1, 7], [2, 7],
  [1, 8], [2, 8],
  [1, 9], [2, 9],
  [0, 10], [1, 10], [2, 10], [3, 10]
].map(tile => tile.toString())

const spawnPoints = []
const lights = {
  '4_0': {
    color: '#f8c11f',
    brightness: .4
  },
  '5_0': {
    color: '#e4a5cf',
    brightness: .3
  },
  '6_0': {
    color: '#078cf7',
    brightness: .4
  },
  '7_0': {
    color: '#fa61ea',
    brightness: .3
  },
  '8_0': {
    color: '#e4a5cf',
    brightness: .2
  },
  '4_1': {
    color: '#f8c11f',
    brightness: .4
  },
  '5_1': {
    color: '#f8c11f',
    brightness: .2
  },
  '6_1': {
    color: '#d3ec08',
    brightness: .4
  },
  '7_1': {
    color: '#d3ec08',
    brightness: .2
  },
  '8_1': {
    color: '#e4f280',
    brightness: .2
  },
  '6_2': {
    color: '#e41f22',
    brightness: .2
  }
}
let lightSources = parseLightSources(lights, stage.bg, tileSize)

let events = []
let objects = []

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

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'endOfTheRabbitHole', tileSize))

const goToRabbitHole = new GameObject('goToRabbitHole', {
  x: 30 * tileSize,
  y: 20 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

goToRabbitHole.touchEvent = () => {
  changeMap('rabbitHole', 'endOfTheRabbitHole')
}
events.push(goToRabbitHole)

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    rabbitHole: { x: 216, y: 158 },
  },
  state: {},
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  lightSources,
  objects,
  npcs: () => [
    new NPC(
      'RD_btc',
      {
        x: 15 * tileSize,
        y: 20 * tileSize + 2
      }
    ),
    new NPC(
      'dancer2',
      {
        x: 8 * tileSize,
        y: 19 * tileSize
      }
    ),
    new NPC(
      'dancer4',
      {
        x: 11 * tileSize,
        y: 20 * tileSize + 1
      }
    ),
    new NPC(
      'dancer1',
      {
        x: 13 * tileSize,
        y: 20 * tileSize
      }
    ),
    new NPC(
      'dancer3',
      {
        x: 15 * tileSize,
        y: 20 * tileSize
      }
    ),
    new NPC(
      'dancer5',
      {
        x: 17 * tileSize,
        y: 20 * tileSize + 1
      }
    )
  ],
  items: () => [],
  events,
  assets: {
    endOfTheRabbitHole,
    dancers
  },
  track: () => 'endOfTheRabbitHole',
  bgColor: () => '#270b08',
  update: () => {
    darken(.9, .81, '#170705')
    drawLightSources(lightSources, 'endOfTheRabbitHole', tileSize)
    constants.menuContext.globalAlpha = .2
    constants.menuContext.fillStyle = CTDLGAME.frame % 32 >= 16 ? '#c8006e' : '#cd8812'
    constants.menuContext.fillRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
    constants.menuContext.globalAlpha = 1
  },
  spawnRates: {}
}