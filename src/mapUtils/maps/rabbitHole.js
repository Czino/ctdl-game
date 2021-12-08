import stage from './stage/rabbitHole'

import constants from '../../constants'
import { CTDLGAME } from '../../gameUtils'
import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import { intersects, makeBoundary } from '../../geometryUtils'
import { random } from '../../arrayUtils'
import darken from '../darken'
import drawLightSources from '../drawLightSources'
import parseLightSources from '../parseLightSources'
import getHitBoxes from '../getHitBoxes'

import NPC from '../../npcs/NPC'
import Item from '../../objects/Item'
import Andreas from '../../enemies/Andreas'
import HodlTarantula from '../../npcs/HodlTarantula'
import Ivan from '../../enemies/Ivan'


import rabbitHole from '../../sprites/rabbitHole.png'
import andreas from '../../sprites/andreas.png'
import rabbit from '../../sprites/rabbit.png'
import hodlTarantula from '../../sprites/hodlTarantula.png'
import hodlTarantulaDenBg from '../../sprites/hodlTarantulaDenBg.png'
import hodlTarantulaDenFg from '../../sprites/hodlTarantulaDenFg.png'
import ivan from '../../sprites/ivan.png'
import shitcoins from '../../sprites/shitcoins.png'
import Candle from '../../objects/Candle'

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
const andreasTeleports = [
  { x: 551, y: 35, w: 1, h: 1 },
  { x: 662, y: 122, w: 1, h: 1 },
  { x: 841, y: 155, w: 1, h: 1 },
  { x: 906, y: 426, w: 1, h: 1 },
  { x: 437, y: 412, w: 1, h: 1 },
  { x: 511, y: 463, w: 1, h: 1 },
  { x: 164, y: 507, w: 1, h: 1 },
  { x: 327, y: 667, w: 1, h: 1 },
  { x: 518, y: 637, w: 1, h: 1 }
]
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

makeConsolidatedBoundary(worldWidth, 0, 1, worldHeight, tileSize)
makeConsolidatedBoundary(0, 0, 1, worldHeight, tileSize)

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'rabbitHole', tileSize))

const goToMempool = new GameObject('goToMempool', {
  x: 3 * tileSize,
  y: 58 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

goToMempool.touchEvent = () => {
  changeMap('mempool', 'rabbitHole')
}
events.push(goToMempool)

const goToEndOfTheRabbitHole = new GameObject('goToEndOfTheRabbitHole', {
  x: 31 * tileSize,
  y: 85 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

goToEndOfTheRabbitHole.touchEvent = () => {
  changeMap('endOfTheRabbitHole', 'rabbitHole')
}
events.push(goToEndOfTheRabbitHole)

const goToDogeMine = new GameObject('goToDogeMine', {
  x: 125 * tileSize,
  y: 69 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

goToDogeMine.touchEvent = () => {
  changeMap('dogeCoinMine', 'rabbitHole')
}
events.push(goToDogeMine)

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    forest: { x: 545, y: 0 },
    endOfTheRabbitHole: { x: 296, y: 660 },
    mempool: { x: 48, y: 454 },
    dogeCoinMine: { x: 964, y: 553 }
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
    new Andreas(
      'andreas',
      {
        x: 545,
        y: 0
      }
    ),
    new HodlTarantula(
      'hodlTarantula',
      {
        x: 662,
        y: 335,
        status: 'idle',
        stayPut: true
      }
    ),
    new Ivan(
      'ivan',
      {
        x: 110 * tileSize,
        y: 43 * tileSize
      }
    ),
    new Candle(
      'barrier-1',
      {
        x: 89 * tileSize,
        y: 42 * tileSize,
        static: true,
        open: 0,
        high: 1,
        low: -32,
        close: -43,
      }
    ),
    new Candle(
      'barrier-2',
      {
        x: 115 * tileSize,
        y: 42 * tileSize,
        static: true,
        open: 0,
        high: 3,
        low: -3 * tileSize,
        close: -3 * tileSize,
      }
    ),
    new NPC(
      'roger',
      {
        x: 67 * tileSize,
        y: 67 * tileSize + 2
      }
    ),
    new NPC(
      'honeybadger',
      {
        x: 342,
        y: 689
      }
    )
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
    rabbitHole,
    andreas,
    rabbit,
    hodlTarantula,
    hodlTarantulaDenBg,
    hodlTarantulaDenFg,
    ivan,
    shitcoins
  },
  track: () => 'darkIsBetter',
  bgColor: () => '#170705',
  update: () => {
    constants.bgContext.drawImage(
      CTDLGAME.assets.hodlTarantulaDenBg,
      0, 0, 87, 36,
      79 * tileSize + 2, 42 * tileSize + 5, 87, 36
    )
    constants.fgContext.drawImage(
      CTDLGAME.assets.hodlTarantulaDenFg,
      0, 0, 87, 36,
      79 * tileSize + 2, 42 * tileSize + 5, 87, 36
    )

    const andreas = CTDLGAME.objects.find(obj => obj.getClass() === 'Andreas')
    if (andreas && !andreas.inViewport && Math.random() < .01) {
      let teleportTo = random(andreasTeleports)
      if (!intersects(teleportTo, CTDLGAME.viewport)) {
        andreas.x = teleportTo.x
        andreas.y = teleportTo.y
      }
    }

    darken(.90, .81, '#170705')
    drawLightSources(lightSources, 'rabbitHole', tileSize)
  },
  spawnRates: {
    rabbit: 0.025
  }
}
