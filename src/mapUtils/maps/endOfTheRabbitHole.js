import { changeMap } from '../changeMap'
import { darken } from '../darken'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import constants from '../../constants'
import { makeBoundary } from '../../geometryUtils'
import NPC from '../../npcs/NPC'
import { CTDLGAME } from '../../gameUtils'
import drawLightSources from '../drawLightSources'
import parseLightSources from '../parseLightSources'
import getHitBoxes from '../getHitBoxes'

import endOfTheRabbitHole from '../../sprites/endOfTheRabbitHole.png'
import dancers from '../../sprites/dancers.png'

export default () => {
  const worldWidth = 32
  const worldHeight = 32
  const tileSize = 8
  const t_0_0 = [0, 0], t_0_1 = [0, 1], t_0_2 = [0, 2], t_0_3 = [0, 3], t_0_4 = [0, 4], t_0_5 = [0, 5], t_0_6 = [0, 6], t_0_7 = [0, 7], t_0_8 = [0, 8], t_0_9 = [0, 9], t_0_10 = [0, 10],
    t_1_0 = [1, 0], t_1_1 = [1, 1], t_1_2 = [1, 2], t_1_3 = [1, 3], t_1_4 = [1, 4], t_1_5 = [1, 5], t_1_6 = [1, 6], t_1_7 = [1, 7], t_1_8 = [1, 8], t_1_9 = [1, 9], t_1_10 = [1, 10],
    t_2_0 = [2, 0], t_2_1 = [2, 1], t_2_2 = [2, 2], t_2_3 = [2, 3], t_2_4 = [2, 4], t_2_5 = [2, 5], t_2_6 = [2, 6], t_2_7 = [2, 7], t_2_8 = [2, 8], t_2_9 = [2, 9], t_2_10 = [2, 10],
    t_3_0 = [3, 0], t_3_1 = [3, 1], t_3_2 = [3, 2], t_3_3 = [3, 3], t_3_4 = [3, 4], t_3_5 = [3, 5], t_3_6 = [3, 6], t_3_7 = [3, 7], t_3_8 = [3, 8], t_3_9 = [3, 9], t_3_10 = [3, 10],
    t_4_0 = [4, 0], t_4_1 = [4, 1], t_4_2 = [4, 2], t_4_3 = [4, 3], t_4_4 = [4, 4], t_4_5 = [4, 5], t_4_6 = [4, 6], t_4_7 = [4, 7], t_4_8 = [4, 8], t_4_9 = [4, 9], t_4_10 = [4, 10],
    t_5_0 = [5, 0], t_5_1 = [5, 1], t_5_2 = [5, 2], t_5_3 = [5, 3], t_5_4 = [5, 4], t_5_5 = [5, 5], t_5_6 = [5, 6], t_5_7 = [5, 7], t_5_8 = [5, 8], t_5_9 = [5, 9], t_5_10 = [5, 10],
    t_6_0 = [6, 0], t_6_1 = [6, 1], t_6_2 = [6, 2], t_6_3 = [6, 3], t_6_4 = [6, 4], t_6_5 = [6, 5], t_6_6 = [6, 6], t_6_7 = [6, 7], t_6_8 = [6, 8], t_6_9 = [6, 9], t_6_10 = [6, 10],
    t_7_0 = [7, 0], t_7_1 = [7, 1], t_7_2 = [7, 2], t_7_3 = [7, 3], t_7_4 = [7, 4], t_7_5 = [7, 5], t_7_6 = [7, 6], t_7_7 = [7, 7], t_7_8 = [7, 8], t_7_9 = [7, 9], t_7_10 = [7, 10],
    t_8_0 = [8, 0], t_8_1 = [8, 1], t_8_2 = [8, 2], t_8_3 = [8, 3], t_8_4 = [8, 4], t_8_5 = [8, 5], t_8_6 = [8, 6], t_8_7 = [8, 7], t_8_8 = [8, 8], t_8_9 = [8, 9], t_8_10 = [8, 10]

  const stage = {
    "parallax": [[]],
    "bg": [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_6_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_6_1],
        [],
        [],
        [t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_4_0],
        [t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_4_2, t_6_2, t_5_2, t_7_2],
        [t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_7_1, t_0_0, t_0_0, t_0_0, t_0_0, t_5_0, t_4_3, t_4_3, t_4_3, t_4_3, t_4_3],
        [t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_4_1, t_4_3, t_4_3, t_4_3, t_4_3, t_4_3, t_6_0, t_0_0, t_5_1, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_7_0, t_4_1, t_5_1, t_6_0, t_5_0],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ],
    "base": [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_3_9, t_2_10, t_1_10, t_1_10, t_2_10, t_2_10, t_1_10, t_2_10, t_1_10, t_1_10, t_2_10, t_1_10, t_2_10, t_2_10, t_1_10, t_1_10, t_2_10, t_1_10, t_2_10, t_1_10, t_0_9],
        [t_0_0, t_0_0, t_0_0, t_3_9, t_2_10, t_2_10, t_3_10, t_1_8, t_2_7, t_1_7, t_1_8, t_2_8, t_1_9, t_2_9, t_1_8, t_2_8, t_2_7, t_1_7, t_1_8, t_2_9, t_1_9, t_1_8, t_2_7, t_1_7, t_2_8, t_2_7, t_0_7],
        [t_0_0, t_0_0, t_0_0, t_3_7, t_1_7, t_2_8, t_2_8, t_2_3, t_3_3, t_2_2, t_3_3, t_2_2, t_3_3, t_2_2, t_3_3, t_2_2, t_3_3, t_2_2, t_3_3, t_2_2, t_3_3, t_2_2, t_3_3, t_2_2, t_3_2, t_1_7, t_0_7],
        [t_0_0, t_0_0, t_0_0, t_3_7, t_1_8, t_2_3, t_3_3, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_3_5, t_2_7, t_0_7],
        [t_0_0, t_0_0, t_0_0, t_3_7, t_1_9, t_0_5, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_3_5, t_2_8, t_0_7],
        [t_0_0, t_0_0, t_0_0, t_3_7, t_2_9, t_0_4, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_3_4, t_1_8, t_0_7],
        [t_0_0, t_0_0, t_0_0, t_3_7, t_1_9, t_0_4, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_3_4, t_1_9, t_0_7],
        [t_0_0, t_0_0, t_0_0, t_3_7, t_2_8, t_0_5, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_3_4, t_2_9, t_0_7],
        [t_0_0, t_0_0, t_0_0, t_3_7, t_2_7, t_0_5, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_3_5, t_2_8, t_0_10, t_0_9],
        [t_0_0, t_0_0, t_0_0, t_3_7, t_1_7, t_0_4, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_3_4, t_2_7, t_1_7, t_0_10, t_1_10, t_1_10, t_2_10, t_2_10],
        [t_0_0, t_0_0, t_0_0, t_3_7, t_2_8, t_0_5, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_2_2, t_3_2, t_2_7, t_1_7, t_1_8, t_1_9, t_2_8],
        [t_0_0, t_0_0, t_0_0, t_3_7, t_2_8, t_0_5, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_2_2, t_3_3, t_2_2, t_3_2, t_1_8],
        [t_0_0, t_0_0, t_0_0, t_3_7, t_1_8, t_0_4, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_2_2],
        [t_0_0, t_0_0, t_0_0, t_3_7, t_2_8, t_0_2, t_1_2, t_2_1, t_1_1, t_1_2],
        [t_0_0, t_0_0, t_0_0, t_3_8, t_2_6, t_2_6, t_1_6, t_1_6, t_2_6, t_3_6, t_0_2, t_1_2, t_1_1, t_3_1, t_1_1, t_2_1, t_3_1, t_2_1, t_1_1, t_0_1, t_1_1, t_1_1, t_2_1, t_1_1, t_1_1, t_3_1, t_2_1, t_3_1, t_2_1, t_3_1, t_2_1, t_1_1],
        [t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_0_0, t_3_8, t_2_6, t_2_6, t_1_6, t_1_6, t_1_6, t_2_6, t_2_6, t_1_6, t_1_6, t_2_6, t_2_6, t_1_6, t_1_6, t_2_6, t_1_6, t_1_6, t_1_6, t_2_6, t_2_6, t_1_6, t_1_6, t_2_6],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ],
    "fg": [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ]
  }
  stage.parallax = parsePattern(stage.parallax, 0, 0)
  stage.bg = parsePattern(stage.bg, 0, 0)
  stage.base = parsePattern(stage.base, 0, 0)
  stage.fg = parsePattern(stage.fg, 0, 0)

  const ramps = [
    t_0_1, t_1_1, t_2_1, t_3_1,
    t_0_2, t_1_2,
    t_0_3, t_1_3,
    t_2_5,
    t_1_9, t_2_9
  ].map(tile => tile.toString())
  const solids = [
    t_0_6, t_1_6, t_2_6, t_3_6,
    t_0_7, t_3_7,
    t_0_8, t_3_8,
    t_0_9, t_3_9,
    t_1_7, t_2_7,
    t_1_8, t_2_8,
    t_1_9, t_2_9,
    t_0_10, t_1_10, t_2_10, t_3_10
  ].map(tile => tile.toString())
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

  objects = objects.concat(getHitBoxes(stage.base, ramps, solids, 'endOfTheRabbitHole', tileSize))

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

  return {
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
}