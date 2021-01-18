import stage from './stage/mempool'

import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import { intersects, makeBoundary } from '../../geometryUtils'
import NPC from '../../npcs/NPC'
import { CTDLGAME } from '../../gameUtils'
import Item from '../../Item'
import Andreas from '../../enemies/Andreas'
import { random } from '../../arrayUtils'
import { addTextToQueue } from '../../textUtils'
import darken from '../darken'
import drawLightSources from '../drawLightSources'
import parseLightSources from '../parseLightSources'
import getHitBoxes from '../getHitBoxes'

import mempool from '../../sprites/mempool.png'

const worldWidth = 128
const worldHeight = 128
const tileSize = 8

stage.parallax = parsePattern(stage.parallax, 0, 0)
stage.bg = parsePattern(stage.bg, 0, 0)
stage.base = parsePattern(stage.base, 0, 0)
stage.fg = parsePattern(stage.fg, 0, 0)
const ramps = [
  [0, 1], [1, 1], [2, 1], [3, 1], [7, 1],
  [0, 2], [1, 2],
  [0, 3], [1, 3],
  [2, 5]
].map(tile => tile.toString())
const solids = [
  [1, 0],
  [0, 6], [1, 6], [2, 6], [3, 6],
  [0, 7], [1, 7], [2, 7], [3, 7],
  [0, 8], [1, 8], [2, 8], [3, 8],
  [0, 9], [1, 9], [2, 9], [3, 9],
  [0, 10], [1, 10], [2, 10], [3, 10],
].map(tile => tile.toString())
const spawnPoints = [].map(tile => tile.toString())
const lights = {
  '4_2': {
    color: '#ddbe24',
    brightness: .2
  },
  '5_2': {
    color: '#ddbe24',
    brightness: .2
  },
  '6_2': {
    color: '#ddbe24',
    brightness: .2
  },
  '4_3': {
    color: '#ddbe24',
    brightness: .2
  },
  '5_3': {
    color: '#ddbe24',
    brightness: .2
  },
  '7_2': {
    color: '#e46622',
    brightness: .3
  },
  '8_2': {
    color: '#e46622',
    brightness: .3
  },
  '6_3': {
    color: '#e46622',
    brightness: .1
  },
  '6_4': {
    color: '#e46622',
    brightness: .5,
    radius: 64
  },
}

let lightSources = parseLightSources(lights, stage.bg, tileSize)
  .concat(parseLightSources(lights, stage.base, tileSize))
  .concat(parseLightSources(lights, stage.fg, tileSize))

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

makeConsolidatedBoundary(worldWidth, 0, 1, worldHeight, tileSize)
makeConsolidatedBoundary(0, 0, 1, worldHeight, tileSize)

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'mempool', tileSize))


objects.find(obj => obj.id === 'ramp-1_3-63_27').makeToggle(false)

const goToRabbitHole = new GameObject('goToRabbitHole', {
  x: 76 * tileSize,
  y: 26 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

goToRabbitHole.touchEvent = () => {
  changeMap('rabbitHole', 'mempool')
}
events.push(goToRabbitHole)

const goToCity = new GameObject('goToCity', {
  x: 31 * tileSize,
  y: 85 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

goToCity.backEvent = () => {
  changeMap('city', 'mempool')
}
events.push(goToCity)

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    rabbitHole: { x: 72 * tileSize, y: 26 * tileSize }
  },
  state: {},
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  removeEnemy: stage.base
    .filter(tile => tile.tile.toString() === '1,0')
    .map(tile => mapTile(tile, tileSize)),
  lightSources,
  objects,
  npcs: () => [
  ],
  items: () => [
    new Item(
      'honeybadger',
      {
        x: 424,
        y: 516
      }
    )
  ],
  events,
  assets: {
    mempool
  },
  track: () => 'underTheSand',
  bgColor: () => '#250d07',
  update: () => {
    darken(.4, .3, '#250d07')
    drawLightSources(lightSources, 'mempool', tileSize)
  },
  spawnRates: {
    rabbit: 0.025
  }
}
