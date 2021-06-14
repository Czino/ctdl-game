import stage from './stage/miningFarm'

import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import constants from '../../constants'
import { makeBoundary } from '../../geometryUtils'
import { CTDLGAME } from '../../gameUtils'
import getHitBoxes from '../getHitBoxes'
import PoliceForce from '../../enemies/PoliceForce'

import miningFarm from '../../sprites/miningFarm.png'
import policeForce from '../../sprites/policeForce.png'
import policeForceWithShield from '../../sprites/policeForceWithShield.png'
import explosion from '../../sprites/explosion.png'

const worldWidth = 128
const worldHeight = 16
const tileSize = 8

stage.parallax = parsePattern(stage.parallax, 0, 0)
stage.bg = parsePattern(stage.bg, 0, 0)
stage.base = parsePattern(stage.base, 0, 0)
stage.fg = parsePattern(stage.fg, 0, 0)
const ramps = []
const solids = [
  [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6]
].map(tile => tile.toString())
const spawnPoints = []
const blinkingLights = [
  [1, 9], [10, 11],
  [1, 13], [10, 14],
  [1, 18], [10, 17],
  [1, 23], [10, 20],
  [1, 28], [10, 24],
  [1, 33], [10, 27],
  [1, 38], [10, 30],
  [1, 43], [10, 33], [10, 36], [10, 39],
  [60, 9], [53, 11],
  [60, 13], [53, 14],
  [60, 18], [53, 17],
  [60, 23], [53, 20],
  [60, 28], [53, 24],
  [60, 33], [53, 27],
  [60, 38], [53, 30],
  [60, 43], [53, 33], [53, 36], [53, 39]
]
const blinkingLightsBg = [
  [14, 13], [18, 15], [45, 15], [49, 13],
  [14, 15], [18, 18], [45, 18], [49, 15],
  [14, 17], [18, 22], [45, 22], [49, 17],
  [14, 21], [18, 24], [45, 24], [49, 21],
  [14, 23], [18, 26], [45, 26], [49, 23],
  [14, 25], [18, 28], [45, 28], [49, 25],
  [14, 27], [18, 30], [45, 30], [49, 27],
  [14, 30], [18, 32], [45, 32], [49, 30],
  [14, 33], [18, 35], [45, 35], [49, 33],
  [14, 36], [18, 37], [45, 37], [49, 36],
  [14, 39], [18, 39], [45, 39], [49, 39]
]
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

makeConsolidatedBoundary(0, worldHeight - 0.25, worldWidth, 3, tileSize)
makeConsolidatedBoundary(0, 0, worldWidth, 1, tileSize)
makeConsolidatedBoundary(worldWidth, 0, 1, worldHeight, tileSize)
makeConsolidatedBoundary(0, 0, 1, worldHeight, tileSize)

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'dogeCoinMine', tileSize))

// const goToRabbitHole = new GameObject('goToRabbitHole', {
//   x: 1 * tileSize,
//   y: 67 * tileSize,
//   w: tileSize,
//   h: 3 * tileSize,
// })

// goToRabbitHole.touchEvent = () => {
//   changeMap('rabbitHole', 'dogeCoinMine')
// }
// events.push(goToRabbitHole)
const underAttack = new GameObject('underAttack', {
  x: 1 * tileSize,
  y: 12 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

underAttack.touchEvent = () => {
  if (CTDLGAME.world.map.state.underAttack) return
  CTDLGAME.world.map.state.underAttack = true
  window.SNDTRCK.initSoundtrack(CTDLGAME.world.map.track())
  // CTDLGAME.objects.push(new PoliceForce(
  //   'test-force',
  //   {
  //     x: 90,
  //     y: 96,
  //     widthShield: Math.random() > .5
  //   }
  // ))
}

events.push(underAttack)

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    citadel: { x: 20, y: 96 }
  },
  state: {
    underAttack: false
  },
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  removeEnemy: stage.fg
    .filter(tile => tile.tile.toString() === '1,0')
    .map(tile => mapTile(tile, tileSize)),
  objects,
  npcs: () => [],
  items: () => [],
  events,
  assets: {
    miningFarm,
    policeForce,
    policeForceWithShield,
    explosion
  },
  track: () => CTDLGAME.world.map.state.underAttack ? 'citadelUnderAttack' : 'miningFarm',
  bgColor: () => '#020105',
  update: () => {
    [
      constants.gameContext,
      constants.charContext
    ].map(context => {
      context.globalAlpha = '.4'
      context.globalCompositeOperation = 'source-atop'
      context.fillStyle = '#0915b8'
      context.fillRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
      context.globalCompositeOperation = 'source-over'
      context.globalAlpha = '1'
    })

    for (let i = 0; i < 16; i++) {
      blinkingLights
        .filter(() => Math.random() > .9)
        .map(light => {
          constants.bgContext.fillStyle = '#010124'
          constants.bgContext.fillRect(light[0] + i * 64, light[1] + 74, 1, 1)
        })
      blinkingLightsBg
        .filter(() => Math.random() > .1)
        .map(light => {
          constants.bgContext.fillStyle = '#525baa'
          constants.bgContext.fillRect(light[0] + i * 64, light[1] + 74, 1, 1)
        })
    }

    if (CTDLGAME.world.map.state.underAttack) {
      constants.skyContext.globalAlpha = '.4'
      constants.skyContext.fillStyle = '#b80909'
      constants.skyContext.fillRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
      constants.skyContext.globalAlpha = '1'
      ;[
        constants.bgContext,
        constants.gameContext,
        constants.charContext
      ].map(context => {
        context.globalCompositeOperation = 'source-atop'
        context.globalAlpha = '.4'
        context.fillStyle = '#b80909'
        context.fillRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
        context.globalCompositeOperation = 'source-over'
        context.globalAlpha = '1'
      })
    }
  },
  spawnRates: {}
}