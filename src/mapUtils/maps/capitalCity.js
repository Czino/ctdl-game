import stage from './stage/capitalCity'

import constants from '../../constants'
import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import { CTDLGAME } from '../../gameUtils'
import { addTextToQueue, setTextQueue } from '../../textUtils'
import { makeBoundary } from '../../geometryUtils'
import getHitBoxes from '../getHitBoxes'
import parseLightSources from '../parseLightSources'
import Citizen from '../../npcs/Citizen'
import Prophetoshi from '../../npcs/Prophetoshi'
import PoliceForce from '../../enemies/PoliceForce'
import Car from '../../objects/Car'

import capitalCity from '../../sprites/capitalCity.png'
import moon from '../../sprites/moon.png'
import citizen1 from '../../sprites/citizen-1.png'
import citizen2 from '../../sprites/citizen-2.png'
import citizen3 from '../../sprites/citizen-3.png'
import citizen4 from '../../sprites/citizen-4.png'
import citizen5 from '../../sprites/citizen-5.png'
import citizen6 from '../../sprites/citizen-6.png'
import prophetoshi from '../../sprites/prophetoshi.png'
import cars from '../../sprites/cars.png'
import policeForce from '../../sprites/policeForce.png'
import policeForceWithShield from '../../sprites/policeForceWithShield.png'
import explosion from '../../sprites/explosion.png'

const worldWidth = 256
const worldHeight = 128
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
  [3, 124, 1, 3],
  [30, 124, 1, 3],
  [44, 124, 1, 3, character => {
    CTDLGAME.menuItem = 0
    CTDLGAME.showShop = character
  }],
  [77, 124, 3, 3, () => {
    changeMap('centralBank', 'capitalCity')
  }],
  [113, 124, 1, 3],
  [216, 124, 1, 3],
  [229, 124, 1, 3],
  [251, 124, 1, 3],
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

const protesters = []
const policeForces = []

for (let i = 1; i < 57; i++) {
  protesters.push(
    new Citizen('protester-' + i, {
      x: 155 * tileSize + Math.round(Math.random() * i * 2), y: 124 * tileSize - 6,
      direction: 'right',
      isUnhappy: true
    })
  )
}
for (let i = 0; i < 6; i++) {
  policeForces.push(
    new PoliceForce('demoPoliceForceWithShield-' + i, {
      x: 170 * tileSize + i * 4 + Math.round(Math.random()), y: 124 * tileSize - 6 + Math.round(Math.random() * 2),
      direction: 'left',
      hasShield: true
    })
  )
}
for (let i = 0; i < 16; i++) {
  policeForces.push(
    new PoliceForce('demoPoliceForce-' + i, {
      x: 170 * tileSize + 24 + i * 4 + Math.round(Math.random()), y: 124 * tileSize - 6 + Math.round(Math.random() * 2),
      direction: 'left',
      hasShield: false
    })
  )
}
const startProtestScene = new GameObject('startProtestScene', {
  x: 155 * tileSize,
  y: 124 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})
startProtestScene.touchEvent = () => {
  if (!CTDLGAME.world.map.state.protestScene || CTDLGAME.world.map.state.protestSceneActivated) return
  activateProtestScene()
}

function activateProtestScene () {
  CTDLGAME.world.map.state.protestSceneActivated = true
  constants.BUTTONS.find(btn => btn.action === 'skipCutScene').active = true

  setTextQueue([])

  addTextToQueue('Protester:\nThe whole world is watching now!')
  addTextToQueue('Protester:\nIt is a class warfare that\'s\nbeen waged on the poor.')
  addTextToQueue('Protester:\nThe elites steal our wealth\nthrough inflation.')
  addTextToQueue('Protester:\nThey are using the financial system to oppress us.')
  addTextToQueue('Protester:\nThey are killing us with\nour own money!')
  addTextToQueue('Protester:\nStop the printing press!\nStop bailing out the elites.')
  addTextToQueue('Protester:\nTo all the people who are\nprotesting the money grab.')
  addTextToQueue('Protester:\nThere\'s a new system,\nI want to present to you.\nThat is open to everyone.')
  addTextToQueue('Protester:\nThis system is called Bitcoin. It was created for this\nvery purpose.')
  addTextToQueue('Protester:\nSo the elites don\'t have\ncontrol over the financial\nsystem anymore.')
  addTextToQueue('Protester:\nWith Bitcoin the elites\ncannot turn on the printing press to bail out their friends.', () => {
    CTDLGAME.objects.find(obj => obj.id === 'protest-leader').applyGravity = true
    CTDLGAME.world.map.state.protestSceneEscalated = true
    CTDLGAME.world.map.state.protestScene = false
    constants.BUTTONS.find(btn => btn.action === 'skipCutScene').active = false
    addTextToQueue('Protester:\nWe no longer let the elites\nkill us with our own mon...')
  })
}
events.push(startProtestScene)

doors.map(door => {
  const doorEvent = new GameObject(`door-${door[0]}-${door[1]}`, {
    x: door[0] * tileSize,
    y: door[1] * tileSize,
    w: door[2] * tileSize,
    h: door[3] * tileSize,
  })
  doorEvent.backEvent = door[4] ? door[4] : () => {
    addTextToQueue('You cannot enter here')
  }
  events.push(doorEvent)
})

const goToMtGox = new GameObject('goToMtGox', {
  x: 1 * tileSize,
  y: 124 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})
goToMtGox.touchEvent = () => {
  changeMap('mtGox', 'capitalCity')
}
events.push(goToMtGox)

const goToPier = new GameObject('goToPier', {
  x: 255 * tileSize,
  y: 124 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})
goToPier.touchEvent = () => {
  changeMap('pier', 'capitalCity')
}
events.push(goToPier)

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'capitalCity', tileSize))

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    mtGox: { x: 8 * tileSize, y: 124 * tileSize - 6 },
    centralBank: { x: 77 * tileSize, y: 124 * tileSize - 6 },
    pier: { x: 252 * tileSize, y: 124 * tileSize - 6 },
  },
  state: {
    protestScene: true,
    protestSceneActivated: false
  },
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  lightSources,
  objects,
  npcs: () => [
    new Car('cotxe', { type: 'familyRed', x: 158 * tileSize, y: 128 * tileSize - 4 - 25, vx: 0 }),
    new Citizen('protest-leader', { x: 163 * tileSize, y: 128 * tileSize - 4 - 25 - 30, direction: 'right', spriteId: 'citizen6', applyGravity: false, isUnhappy: true}),
    new Prophetoshi('prophetoshi', { x: 30 * tileSize, y: 123 * tileSize})
  ]
    .concat(protesters)
    .concat(policeForces),
  items: () => [],
  events,
  assets: {
    capitalCity,
    moon,
    citizen1,
    citizen2,
    citizen3,
    citizen4,
    citizen5,
    citizen6,
    prophetoshi,
    cars,
    policeForce,
    policeForceWithShield,
    explosion
  },
  track: () => 'capitalCity',
  init: () => {
    if (!CTDLGAME.world.map.state.protestScene) {
      CTDLGAME.objects
        .filter(obj => /cotxe|protest|demoPolice/.test(obj.id))
        .map(obj => obj.remove = true)
    }

    if (CTDLGAME.world.map.state.protestSceneActivated && !CTDLGAME.world.map.state.protestSceneEscalated) {
      activateProtestScene()
    }
  },
  canSetBlocks: false,
  overworld: true,
  spawnRates: {
    citizen: .08,
    car: 0.06,
    policeForce: .01
  }
}
