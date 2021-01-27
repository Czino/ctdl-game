import stage from './stage/building'

import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import { makeBoundary } from '../../geometryUtils'
import getHitBoxes from '../getHitBoxes'

import building from '../../sprites/building.png'
import { addTextToQueue } from '../../textUtils'
const worldWidth = 28
const worldHeight = 128
const tileSize = 8

stage.parallax = parsePattern(stage.parallax, 0, 0)
stage.bg = parsePattern(stage.bg, 0, 0)
stage.base = parsePattern(stage.base, 0, 0)
stage.fg = parsePattern(stage.fg, 0, 0)
const ramps = [
  [0, 1], [2, 3],
  [0, 4], [1, 4],
  [0, 5], [1, 5]
].map(tile => tile.toString())
const solids = [
  [1, 0],
  [1, 1], [2, 1], [3, 1],
  [2, 2],
  [2, 3]
].map(tile => tile.toString())
const spawnPoints = []

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

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'building', tileSize))

objects.find(obj => obj.id === 'ramp-0_1-13_109').makeToggle(false)
objects.find(obj => obj.id === 'ramp-1_4-9_114').makeToggle(false)
objects.find(obj => obj.id === 'ramp-0_1-13_115').makeToggle(false)
objects.find(obj => obj.id === 'ramp-1_4-9_120').makeToggle(false)
objects.find(obj => obj.id === 'ramp-0_1-13_121').makeToggle(false)
objects.find(obj => obj.id === 'ramp-1_4-9_126').makeToggle(false)

objects.find(obj => obj.id === 'ramp-1_4-13_61').makeToggle(false)
objects.find(obj => obj.id === 'ramp-0_1-17_56').makeToggle(false)

const goToFlat4th = new GameObject('goToFlat4th', {
  x: 2 * tileSize,
  y: 106 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

goToFlat4th.backEvent = () => {
  window.SELECTEDCHARACTER.x = 3 * tileSize
  window.SELECTEDCHARACTER.y = 22 * tileSize - 4
}
events.push(goToFlat4th)

const comeFromFlat4th = new GameObject('comeFromFlat4th', {
  x: 1 * tileSize,
  y: 22 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

comeFromFlat4th.touchEvent = () => {
  window.SELECTEDCHARACTER.x = 2 * tileSize
  window.SELECTEDCHARACTER.y = 106 * tileSize - 4
}
events.push(comeFromFlat4th)


const locked3rd = new GameObject('locked3rd', {
  x: 2 * tileSize,
  y: 112 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

locked3rd.backEvent = () => {
  addTextToQueue('The door is locked.')
}
events.push(locked3rd)

const goToFlat3rd = new GameObject('goToFlat3rd', {
  x: 7 * tileSize,
  y: 112 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

goToFlat3rd.backEvent = () => {
  window.SELECTEDCHARACTER.x = 3 * tileSize
  window.SELECTEDCHARACTER.y = 59 * tileSize - 4
}
events.push(goToFlat3rd)

const comeFromFlat3rd = new GameObject('comeFromFlat3rd', {
  x: 1 * tileSize,
  y: 59 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

comeFromFlat3rd.touchEvent = () => {
  window.SELECTEDCHARACTER.x = 7 * tileSize
  window.SELECTEDCHARACTER.y = 112 * tileSize - 4
}
events.push(comeFromFlat3rd)


const locked2nd = new GameObject('locked2nd', {
  x: 7 * tileSize,
  y: 118 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

locked2nd.backEvent = () => {
  addTextToQueue('The door is locked.')
}
events.push(locked2nd)

const goToFlat2nd = new GameObject('goToFlat2nd', {
  x: 2 * tileSize,
  y: 118 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

goToFlat2nd.backEvent = () => {
  window.SELECTEDCHARACTER.x = 6 * tileSize
  window.SELECTEDCHARACTER.y = 81 * tileSize - 4
}
events.push(goToFlat2nd)

const comeFromFlat2nd = new GameObject('comeFromFlat2nd', {
  x: 6 * tileSize,
  y: 81 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

comeFromFlat2nd.backEvent = () => {
  window.SELECTEDCHARACTER.x = 2 * tileSize
  window.SELECTEDCHARACTER.y = 118 * tileSize - 4
}
events.push(comeFromFlat2nd)


const locked1st = new GameObject('locked1st', {
  x: 13 * tileSize,
  y: 124 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

locked1st.backEvent = () => {
  addTextToQueue('The door is locked.')
}
events.push(locked1st)

const goToCity = new GameObject('goToCity', {
  x: 7 * tileSize,
  y: 124 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

goToCity.backEvent = () => {
  changeMap('city', 'building')
}
events.push(goToCity)

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    newGame: { x: 6 * tileSize, y: 22 * tileSize - 4 },
    city: { x: 7 * tileSize, y: 124 * tileSize - 4  }
  },
  state: {},
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  objects,
  npcs: () => [],
  items: () => [],
  events,
  assets: {
    building
  },
  track: () => 'shaded',
  bgColor: () => '#212121',
  update: () => {},
  spawnRates: {}
}