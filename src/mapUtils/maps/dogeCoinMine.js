import stage from './stage/dogeCoinMine'

import { changeMap } from '../changeMap'
import { darken } from '../darken'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import { makeBoundary } from '../../geometryUtils'
import Elevator from '../../objects/Elevator'
import Doge from '../../npcs/Doge'
import drawLightSources from '../drawLightSources'
import parseLightSources from '../parseLightSources'
import getHitBoxes from '../getHitBoxes'

import dogeCoinMine from '../../sprites/dogeCoinMine.png'
import doge from '../../sprites/doge.png'

const worldWidth = 128
const worldHeight = 128
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
  [1, 0],
  [0, 6], [1, 6], [2, 6], [3, 6],
  [0, 7], [3, 7],
  [0, 8], [3, 8],
  [0, 9], [3, 9],
  [1, 7], [2, 7],
  [1, 8], [2, 8],
  [1, 9], [2, 9],
  [0, 10], [1, 10], [2, 10], [3, 10]
].map(tile => tile.toString())
const spawnPoints = [
  [0, 1], [1, 1], [2, 1], [3, 1]
].map(tile => tile.toString())
const lights = {
  '5_1': {
    color: '#dfa718',
    brightness: .4
  }
}
let lightSources = parseLightSources(lights, stage.fg, tileSize)

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

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'dogeCoinMine', tileSize))

const goToRabbitHole = new GameObject('goToRabbitHole', {
  x: 1 * tileSize,
  y: 67 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

goToRabbitHole.touchEvent = () => {
  changeMap('rabbitHole', 'dogeCoinMine')
}
events.push(goToRabbitHole)


const goToMtGox = new GameObject('goToMtGox', {
  x: 31 * tileSize,
  y: 7 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

goToMtGox.touchEvent = () => {
  changeMap('mtGox', 'dogeCoinMine')
}
events.push(goToMtGox)


export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    rabbitHole: { x: 30, y: 531 },
    mtGox: { x: 34 * tileSize, y: 7 * tileSize + 4 }
  },
  state: {},
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  removeEnemy: stage.fg
    .filter(tile => tile.tile.toString() === '1,0')
    .map(tile => mapTile(tile, tileSize)),
  lightSources,
  objects,
  npcs: () => [
    new Elevator(
      'elevator-1',
      {
        x: 12 * tileSize,
        y: 65 * tileSize,
        offsetY: 11,
        maxOffset: 378,
        minOffset: 11
      }
    ),
    new Elevator(
      'elevator-2',
      {
        x: 64 * tileSize,
        y: 95 * tileSize,
        offsetY: 155,
        maxOffset: 155,
        minOffset: 6
      }
    ),
    new Elevator(
      'elevator-3',
      {
        x: 97 * tileSize,
        y: 52 * tileSize,
        offsetY: 347,
        maxOffset: 347,
        minOffset: 12
      }
    ),
    new Elevator(
      'elevator-4',
      {
        x: 115 * tileSize,
        y: 31 * tileSize,
        offsetY: 179,
        maxOffset: 179,
        minOffset: 6
      }
    ),
    new Elevator(
      'elevator-5',
      {
        x: 46 * tileSize,
        y: 8 * tileSize,
        offsetY: 187,
        maxOffset: 187,
        minOffset: 0
      }
    ),
    new Doge(
      'doge-1',
      {
        x: 4 * tileSize - 4,
        y: 114 * tileSize + 5,
        color: 'red',
        direction: 'left'
      }
    ),
    new Doge(
      'doge-2',
      {
        x: 37 * tileSize - 4,
        y: 119 * tileSize + 5,
        color: 'green',
        direction: 'right'
      }
    ),
    new Doge(
      'doge-3',
      {
        x: 42 * tileSize - 4,
        y: 119 * tileSize + 6,
        color: 'blue',
        direction: 'left'
      }
    ),
    new Doge(
      'doge-4',
      {
        x: 118 * tileSize - 6,
        y: 97 * tileSize + 5,
        color: 'red',
        direction: 'right'
      }
    ),
    new Doge(
      'doge-5',
      {
        x: 101 * tileSize,
        y: 97 * tileSize + 5,
        color: 'green',
        direction: 'right'
      }
    ),
    new Doge(
      'doge-6',
      {
        x: 76 * tileSize - 2,
        y: 56 * tileSize + 6,
        color: 'blue',
        direction: 'left'
      }
    ),
    new Doge(
      'doge-7',
      {
        x: 72 * tileSize - 4,
        y: 58 * tileSize + 5,
        color: 'red',
        direction: 'right'
      }
    ),
    new Doge(
      'doge-8',
      {
        x: 80 * tileSize - 4,
        y: 55 * tileSize + 6,
        color: 'blue',
        direction: 'right'
      }
    ),
    new Doge(
      'doge-9',
      {
        x: 94 * tileSize,
        y: 55 * tileSize + 5,
        color: 'red',
        direction: 'right'
      }
    ),
    new Doge(
      'doge-10',
      {
        x: 93 * tileSize - 4,
        y: 81 * tileSize + 6,
        color: 'green',
        direction: 'left'
      }
    ),
    new Doge(
      'doge-11',
      {
        x: 78 * tileSize - 4,
        y: 81 * tileSize + 6,
        color: 'red',
        direction: 'left'
      }
    ),
    new Doge(
      'doge-12',
      {
        x: 112 * tileSize - 4,
        y: 55 * tileSize + 5,
        color: 'green',
        direction: 'right'
      }
    ),
    new Doge(
      'doge-13',
      {
        x: 61 * tileSize - 4,
        y: 116 * tileSize + 5,
        color: 'blue',
        direction: 'right'
      }
    )
  ],
  items: () => [],
  events,
  assets: {
    dogeCoinMine,
    doge
  },
  track: () => 'bullsVsBears',
  bgColor: () => '#1d0905',
  update: () => {
    darken(.2, .2, '#170705')
    drawLightSources(lightSources, 'dogeCoinMine', tileSize)
  },
  spawnRates: {}
}
