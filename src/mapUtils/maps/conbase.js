import stage from './stage/conbase'

import { CTDLGAME, getTimeOfDay } from '../../gameUtils'
import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import Brian from '../../enemies/Brian'
import Shitcoiner from '../../enemies/Shitcoiner'
import Bagholder from '../../enemies/Bagholder'
import { easeInOut, makeBoundary } from '../../geometryUtils'
import getHitBoxes from '../getHitBoxes'

import conbase from '../../sprites/conbase.png'
import shitcoiner from '../../sprites/shitcoiner.png'
import bagholder from '../../sprites/bagholder.png'
import brian from '../../sprites/brian.png'
import moon from '../../sprites/moon.png'
import parseLightSources from '../parseLightSources'
import darken from '../darken'
import drawLightSources from '../drawLightSources'
import Item from '../../objects/Item'

const worldWidth = 64
const worldHeight = 64

const tileSize = 8

stage.parallax = parsePattern(stage.parallax, 0, 0)
stage.bg = parsePattern(stage.bg, 0, 0)
stage.base = parsePattern(stage.base, 0, 0)
stage.fg = parsePattern(stage.fg, 0, 0)
const ramps = [
  [0, 1],
  [0, 4], [1, 4]
].map(tile => tile.toString())
const solids = [
  [1, 0], [1, 1], [2, 1], [3, 1],
  [2, 2],
  [2, 3]
].map(tile => tile.toString())
const spawnPoints = [
  [0, 1]
].map(tile => tile.toString())
const lights = {
  '4_0': {
    color: '#ffbb00',
    brightness: .3,
    radius: 32
  }
}
let lightSources = parseLightSources(lights, stage.fg, tileSize)
  .map(light => ({
    ...light,
    y: light.y + tileSize
  }))

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

const goToCity = new GameObject('goToCity', {
  x: 2 * tileSize,
  y: 60 * tileSize,
  w: 2 * tileSize,
  h: 3 * tileSize,
})

goToCity.backEvent = () => {
  changeMap('city', 'conbase')
}

const goToForest = new GameObject('goToForest', {
  x: 60 * tileSize,
  y: 60 * tileSize,
  w: 2 * tileSize,
  h: 3 * tileSize,
})

goToForest.backEvent = () => {
  const canGoToForest = !CTDLGAME.objects.find(obj => obj.id === 'brian' && obj.status !== 'rekt')
  if (canGoToForest) {
    changeMap('forest', 'conbase')
  }
}


events.push(goToCity)
events.push(goToForest)

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'conbase', tileSize))


objects.find(obj => obj.id === 'ramp-1_4-14_62').makeToggle(false)
objects.find(obj => obj.id === 'ramp-0_1-18_57').makeToggle(false)
objects.find(obj => obj.id === 'ramp-1_4-14_56').makeToggle(false)
objects.find(obj => obj.id === 'ramp-0_1-18_51').makeToggle(false)

objects.find(obj => obj.id === 'ramp-0_1-59_51').makeToggle(true)
objects.find(obj => obj.id === 'ramp-1_4-55_56').makeToggle(true)
objects.find(obj => obj.id === 'ramp-0_1-44_57').makeToggle(true)
objects.find(obj => obj.id === 'ramp-0_4-48_62').makeToggle(true)

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    city: { x: 4 * tileSize, y: 60 * tileSize - 2},
    forest: { x: 60 * tileSize, y: 60 * tileSize - 2}
  },
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  objects,
  npcs: () => [
    new Brian(
      'brian',
      {
        x: 55 * tileSize,
        y: 48 * tileSize - 2
      }
    )
  ].concat(
    [
      [35, 60],
      [34, 60],
      [28, 60],
      [31, 54],
      [7, 54],
      [9, 54],
      [29, 48],
      [30, 48],
      [32, 48],
      [46, 54],
      [57, 60]
    ].map((coords, i) => new Shitcoiner(
      'shitcoiner-' + i,
      {
        x: coords[0] * tileSize,
        y: coords[1] * tileSize - 2,
        senseRadius: 20
      }
    ))
  ).concat(
    [
      [2, 48],
      [61, 54]
    ].map((coords, i) => new Bagholder(
      'bagholder-' + i,
      {
        x: coords[0] * tileSize,
        y: coords[1] * tileSize - 2,
        senseRadius: 20
      }
    ))
  ),
  items: () => [
    new Item('taco', { x: 31 * tileSize, y: 49 * tileSize - 2, applyGravity: false }),
    new Item('honeybadger', { x: 42 * tileSize, y: 62 * tileSize })
  ],
  lightSources,
  events,
  assets: {
    conbase,
    shitcoiner,
    bagholder,
    brian,
    moon
  },
  update: () => {
    let timeOfDay = getTimeOfDay()
    let y = timeOfDay < 4 || timeOfDay > 20 ? 1 : 0

    if (timeOfDay >= 4 && timeOfDay <= 6) {
      y = 1 - easeInOut((4 - timeOfDay) / -2, 3)
    } else if (timeOfDay >= 17 && timeOfDay <= 20) {
      y = easeInOut((timeOfDay - 17) / 3, 3)
    }
    if (y > 0) {
      darken(y / 2, y / 2, '#212121')
      drawLightSources(lightSources, 'conbase', tileSize, y, false)
    }
  },
  track: () => 'imperayritzDeLaCiutatIoyosa',
  canSetBlocks: false,
  overworld: true,
  spawnRates: {}
}