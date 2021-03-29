import stage from './stage/citadelBeach'

import constants from '../../constants'
import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import { CTDLGAME, getTimeOfDay } from '../../gameUtils'
import { easeInOut, makeBoundary } from '../../geometryUtils'
import { drawCrispSine, drawSine } from '../../geometryUtils/drawSineWave'
import getHitBoxes from '../getHitBoxes'
import darken from '../darken'
import drawLightSources from '../drawLightSources'
import parseLightSources from '../parseLightSources'
import Ferry from '../../objects/Ferry'
import BlueMoon from '../../npcs/BlueMoon'
import Chappie from '../../npcs/Chappie'

import citadelBeach from '../../sprites/citadelBeach.png'
import moon from '../../sprites/moon.png'
import NPC from '../../sprites/NPCs.png'
import nakadaiMonarch from '../../sprites/nakadaiMonarch.png'
import ferry from '../../sprites/ferry.png'
import blueMoon from '../../sprites/blueMoon.png'
import chappie from '../../sprites/chappie.png'
import { changeVolume } from '../../soundtrack'

const worldWidth = 128
const worldHeight = 128
const tileSize = 8

stage.parallax = parsePattern(stage.parallax, 0, 0)
stage.bg = parsePattern(stage.bg, 0, 0)
stage.base = parsePattern(stage.base, 0, 0)
stage.fg = parsePattern(stage.fg, 0, 0)
const ramps = [
  [7, 0], [8, 0], [9, 0],
  [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1]
].map(tile => tile.toString())
const solids = [
  [1, 0],
  [0, 2], [1, 2], [2, 2], [3, 2],
  [8, 1], [9, 1],
  [8, 2], [9, 2]
].map(tile => tile.toString())
const spawnPoints = []
const lights = {
  '6_8': {
    color: '#f2007c',
    brightness: .2,
    radius: 32
  },
  '7_8': {
    color: '#f2a900',
    brightness: .2,
    radius: 32
  },
  '8_8': {
    color: '#3df200',
    brightness: .2,
    radius: 32
  },
  '9_8': {
    color: '#0071f2',
    brightness: .2,
    radius: 32
  },
  '10_8': {
    color: '#f2007c',
    brightness: .2,
    radius: 32
  },
  '11_8': {
    color: '#f2a900',
    brightness: .2,
    radius: 32
  },
  '12_8': {
    color: '#f2007c',
    brightness: .2,
    radius: 32
  },
  '10_10': {
    color: '#f2a900',
    brightness: .3,
    radius: 64
  },
  '11_10': {
    color: '#f2a900',
    brightness: .3,
    radius: 64
  },
  '12_10': {
    color: '#f2a900',
    brightness: .3,
    radius: 64
  }
}
let lightSources = parseLightSources(lights, stage.bg, tileSize)
  .concat(parseLightSources(lights, stage.base, tileSize))
  .concat(parseLightSources(lights, stage.fg, tileSize))

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

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'citadelBeach', tileSize))

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    wideRiver: { x: 6 * tileSize, y: 121 * tileSize - 6 },
    citadel: { x: (worldWidth - 6) * tileSize, y: 121 * tileSize - 6 }
  },
  state: {},
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  lightSources,
  objects,
  npcs: () => [
    new BlueMoon(
      'blueMoon',
      {
        x: 59 * tileSize,
        y: 120 * tileSize,
        context: 'fgContext'
      }
    ),
    new Chappie(
      'chappie',
      {
        x: 61 * tileSize,
        y: 120 * tileSize,
        context: 'fgContext'
      }
    )
  ],
  items: () => [],
  events,
  assets: {
    citadelBeach,
    moon,
    NPC,
    nakadaiMonarch,
    ferry,
    blueMoon,
    chappie
  },
  track: () => 'lambada',
  init: from => {
    const ferry = CTDLGAME.objects.find(obj => obj.id === 'ferry')

    if (!ferry && from) {
      CTDLGAME.objects.unshift(new Ferry(
        'ferry',
        {
          x: 1 * tileSize - 4,
          y: 118 * tileSize - 4,
          direction: 'left',
          context: 'charContext',
          vx: 0
        }
      ))
    } else {
      CTDLGAME.objects = CTDLGAME.objects.sort(a => a.id === 'ferry' ? 1 : -1)
    }
  },
  update: () => {
    const ferry = CTDLGAME.objects.find(obj => obj.id === 'ferry')

    if (ferry.vx && ferry.x < -6 * tileSize) {
      changeMap('wideRiver', 'citadelBeach')
    }

    drawWaterBody({
      waterHeight: (worldHeight - 2) * tileSize - 6,
      context: 'charContext',
      direction: -1,
      freq: 24,
      velocity: 12,
      start: 0,
      end: 40 * tileSize
    })

    // TODO make this global for overworld: true ?
    let timeOfDay = getTimeOfDay()
    let y = timeOfDay < 4 || timeOfDay > 20 ? 1 : 0

    if (timeOfDay >= 4 && timeOfDay <= 6) {
      y = 1 - easeInOut((4 - timeOfDay) / -2, 3)
    } else if (timeOfDay >= 17 && timeOfDay <= 20) {
      y = easeInOut((timeOfDay - 17) / 3, 3)
    }
    if (y > 0) {
      darken(y / 2, y / 2, '#212121')
      drawLightSources(lightSources, 'citadelBeach', tileSize, y)
    }


    changeVolume(
      window.SELECTEDCHARACTER.x / (60 * tileSize)
    )
  },
  canSetBlocks: false,
  overworld: true,
  spawnRates: {}
}


function drawWaterBody({ waterHeight, context, direction, freq, velocity, start, end }) {
  const wave = Math.sin(CTDLGAME.frame / 12) / 4
  const shift = CTDLGAME.frame * velocity * direction

  direction = direction || 1
  freq = freq || 70
  velocity = velocity || 42
  start = start ?? CTDLGAME.viewport.x
  end = end ?? 40

  constants[context].fillStyle = '#2a72bd'
  constants[context].globalAlpha = 1
  constants[context].beginPath()
  drawSine(
    constants[context],
    start, end + 1,
    waterHeight + 1,
    freq, 1 + wave, shift
  )
  constants[context].lineTo(end + 1, worldHeight * tileSize)
  constants[context].lineTo(start, worldHeight * tileSize)
  constants[context].lineTo(start, waterHeight)
  constants[context].fill()

  constants[context].fillStyle = '#114071'
  drawCrispSine(
    constants[context],
    start, end + 1,
    waterHeight,
    freq, 1 + wave, shift
  )

  constants[context].fillStyle = '#185ea7'
  drawCrispSine(
    constants[context],
    start, end + 1,
    waterHeight + 1,
    freq - 2, 1 + wave, shift
  )

  constants[context].fillStyle = '#3d7dbf'
  drawCrispSine(
    constants[context],
    start, end + 1,
    waterHeight + 1,
    freq + 2, 1 + wave, shift
  )

  let offset = Math.sin(CTDLGAME.frame / 96 + 40) * 30
  constants[context].fillStyle = '#185ea7'
  drawCrispSine(
    constants[context],
    start + 10 + offset, end + offset,
    waterHeight + 12,
    freq - 2, 1 - wave, shift
  )
  constants[context].fillStyle = '#3d7dbf'
  drawCrispSine(
    constants[context],
    start + 10 + offset, end + offset,
    waterHeight + 11,
    freq - 2, 1 - wave, shift
  )

  offset = Math.sin(CTDLGAME.frame / 108) * 30
  constants[context].fillStyle = '#185ea7'
  drawCrispSine(
    constants[context],
    start + 50 + offset, end + 40 + offset + 12 * Math.sin(CTDLGAME.frame / 103),
    waterHeight + 18,
    -65, 1 - wave * direction, shift
  )
  constants[context].fillStyle = '#3d7dbf'
  drawCrispSine(
    constants[context],
    start + 50 + offset, end + 40 + offset + 12 * Math.sin(CTDLGAME.frame / 103),
    waterHeight + 17,
    -65, 1 - wave * direction, shift
  )

  offset = Math.sin(CTDLGAME.frame / 132 - 32) * 30
  constants[context].fillStyle = '#185ea7'
  drawCrispSine(
    constants[context],
    start + 10 + offset, end + offset + 12 * Math.sin(CTDLGAME.frame / 99),
    waterHeight + 7,
    69, 1 + wave * direction, shift
  )
  constants[context].fillStyle = '#3d7dbf'
  drawCrispSine(
    constants[context],
    start + 10 + offset, end + offset + 10 * Math.sin(CTDLGAME.frame / 99),
    waterHeight + 6,
    69, 1 + wave, shift
  )

}