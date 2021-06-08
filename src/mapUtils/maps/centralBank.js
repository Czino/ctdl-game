import stage from './stage/centralBank'

import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import { CTDLGAME } from '../../gameUtils'
import {  intersects, makeBoundary } from '../../geometryUtils'
import constants from '../../constants'
import getHitBoxes from '../getHitBoxes'
import parseLightSources from '../parseLightSources'
import GameObject from '../../GameObject'
import SnakeBitken from '../../npcs/SnakeBitken'
import { addTextToQueue } from '../../textUtils'
import ModernElevator from '../../objects/ModernElevator'
import BankRobot from '../../enemies/BankRobot'

import centralBank from '../../sprites/centralBank.png'
import snakeBitken from '../../sprites/snakeBitken.png'
import bankRobot from '../../sprites/bankRobot.png'
import policeForce from '../../sprites/policeForce.png'
import policeForceWithShield from '../../sprites/policeForceWithShield.png'
import explosion from '../../sprites/explosion.png'

const worldWidth = 128
const worldHeight = 128
const tileSize = 8

stage.parallax = parsePattern(stage.parallax, 0, 0)
stage.bg = parsePattern(stage.bg, 0, 0)
stage.base = parsePattern(stage.base, 0, 0)
stage.fg = parsePattern(stage.fg, 0, 0)
const ramps = [].map(tile => tile.toString())
const solids = [
  [1, 0], [2, 0], [3, 0],
  [0, 1], [1, 1],
  [0, 2], [1, 2],
  [1, 8], [0, 8], [2, 8]
].map(tile => tile.toString())
const spawnPoints = [
  [0, 1], [1, 1]
].map(tile => tile.toString())
const lights = {
}
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

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'centralBank', tileSize))


const goToCapitalCity = new GameObject('goToCapitalCity', {
  x: 1 * tileSize,
  y: 124 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})
goToCapitalCity.touchEvent = () => {
  changeMap('capitalCity', 'centralBank')
}
events.push(goToCapitalCity)

const startClosingBank = new GameObject('startClosingBank', {
  x: 45 * tileSize,
  y: 105 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})
startClosingBank.touchEvent = () => {
  if (CTDLGAME.world.map.state.bankingHoursAlert || CTDLGAME.world.map.state.bankingHoursOver) return
  CTDLGAME.world.map.state.bankingHoursAlert = true
  CTDLGAME.world.map.state.secondsUntilClose = 60
}
events.push(startClosingBank)

const fogsOfWar = [
  { x: 0, y: 89.5, w: 64, h: 11},
  { x: 0, y: 100.5, w: 64, h: 9},
  { x: 0, y: 109.5, w: 64, h: 8},
  { x: 0, y: 117.5, w: 64, h: 11},
].map((fogOfWar, i) => new GameObject(`fogOfWar-${i}`, {
  x: fogOfWar.x * tileSize,
  y: fogOfWar.y * tileSize,
  w: fogOfWar.w * tileSize,
  h: fogOfWar.h * tileSize
}))
.map(fogOfWar => {
  fogOfWar.opacity = 1
  return fogOfWar
})

;[
  [30, 124, 'Banking clerk:\nWelcome to Ripam Centralis, how may I help you?'],
  [32, 124, 'Banking clerk:\nWelcome to Ripam Centralis, how can I help you?'],
  [38, 124, 'Banking clerk:\nWelcome to Ripam Centralis, how may I help you?'],
  [44, 124, 'Banking clerk:\nWelcome to Ripam Centralis, how may I help you?']
].map((clerk, i) => {
  let bankingClerk = new GameObject(`clerk-${i}`, {
    x: clerk[0] * tileSize,
    y: clerk[1] * tileSize,
    w: 2 * tileSize,
    h: 4 * tileSize
  })

  bankingClerk.line = clerk[2]
  bankingClerk.backEvent = function() {
    if (!this.touched) {
      addTextToQueue(this.line, () => this.touched = false)
      this.touched = true
    }
  }
  events.push(bankingClerk)
})


let underCoverClerk = new GameObject(`underCoverClerk`, {
  x: 42 * tileSize,
  y: 124 * tileSize,
  w: 2 * tileSize,
  h: 4 * tileSize
})

underCoverClerk.backEvent = function() {
  if (!this.touched) {
    let willHelp = CTDLGAME.world.map.state.underCoverClerkHelps // TODO connect event
    let line = willHelp ? 'Banking clerk:\nWelcome to Ripam Centralis, how may I help you?': 'Banking clerk:\nWelcome to Ripam Centralis, how may I help you?'
    addTextToQueue(line, () => {
      this.touched = false
      if (willHelp) {
        // give item
      }
    })
    this.touched = true
  }
}
events.push(underCoverClerk)


export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    capitalCity: { x: 3 * tileSize, y: 124 * tileSize - 6 }
  },
  state: {},
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  lightSources,
  objects,
  npcs: () => [
    new ModernElevator(
      'elevator-1',
      {
        x: 5 * tileSize,
        ys: [
          105 * tileSize,
          113 * tileSize,
          123 * tileSize
        ]
      }
    ),
    new ModernElevator(
      'elevator-2',
      {
        x: 59 * tileSize,
        ys: [
          96 * tileSize,
          123 * tileSize
        ],
        locked: true
      }
    ),
    new SnakeBitken(
      'snakeBitken',
      {
        x: 2 * tileSize,
        y: 105 * tileSize,
        context: 'parallaxContext'
      }
    ),
    new BankRobot(
      'bankrobot-1',
      {
        x: 45 * tileSize,
        y: 105 * tileSize,
        direction: 'right'
      }
    )
  ],
  items: () => [],
  init: () => {
    // move elevators to the beginning to avoid drawing over characters
    CTDLGAME.objects = CTDLGAME.objects.sort(a => a.getClass() === 'ModernElevator' ? -1 : 0)
  },
  update: () => {
    constants.fgContext.fillStyle = '#212121'
    fogsOfWar
      .map(fogOfWar => {
        if (intersects(fogOfWar.getBoundingBox(), window.SELECTEDCHARACTER.getBoundingBox())) {
          fogOfWar.opacity -= .075
        } else {
          fogOfWar.opacity += .075
        }
        fogOfWar.opacity = Math.min(1, fogOfWar.opacity)
        fogOfWar.opacity = Math.max(0, fogOfWar.opacity)
        return fogOfWar
      })
      .filter(fogOfWar => fogOfWar.opacity !== 0)
      .map(fogOfWar => {
        constants.fgContext.globalAlpha = fogOfWar.opacity
        constants.fgContext.fillRect(fogOfWar.x, fogOfWar.y + 2, fogOfWar.w, fogOfWar.h)
      })
    constants.fgContext.globalAlpha = 1

    if (CTDLGAME.world.map.state.codeRed && !CTDLGAME.world.map.state.codeRedCalled) {
      addTextToQueue('Voice com:\nAttention! Code red! A bank robbery is in progress.')
      addTextToQueue('Voice com:\nAll security personel to code red stations')
      CTDLGAME.world.map.state.codeRedCalled = true
    }
    if (CTDLGAME.world.map.state.bankingHoursAlert) {
      CTDLGAME.world.map.state.secondsUntilClose -= 0.125
      if (CTDLGAME.world.map.state.secondsUntilClose === 0) {
        CTDLGAME.world.map.state.bankingHoursAlert = false
        CTDLGAME.world.map.state.bankingHoursOver = true
        addTextToQueue('Voice com:\nThe bank and its employees whish to thank you for allowing us to serve you.')
        addTextToQueue('Voice com:\nBanking hours are now\nover.')
      }
    }
  },
  events,
  assets: {
    centralBank,
    snakeBitken,
    bankRobot,
    policeForce,
    policeForceWithShield,
    explosion
  },
  track: () => 'centralBank',
  spawnRates: {}
}
