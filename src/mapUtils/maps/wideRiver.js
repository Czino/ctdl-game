import stage from './stage/wideRiver'

import constants from '../../constants'
import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import { CTDLGAME } from '../../gameUtils'
import { makeBoundary } from '../../geometryUtils'
import { drawCrispSine, drawSine } from '../../geometryUtils/drawSineWave'
import getHitBoxes from '../getHitBoxes'
import parseLightSources from '../parseLightSources'
import Ferry from '../../objects/Ferry'
import BearWhale from '../../enemies/BearWhale'

import wideRiver from '../../sprites/wideRiver.png'
import moon from '../../sprites/moon.png'
import NPC from '../../sprites/NPCs.png'
import nakadaiMonarch from '../../sprites/nakadaiMonarch.png'
import ferry from '../../sprites/ferry.png'
import bearWhale from '../../sprites/bearWhale.png'
import wave from '../../sprites/wave.png'
import { addTextToQueue, setTextQueue } from '../../textUtils'

const worldWidth = 128
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
const lights = {}
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

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'wideRiver', tileSize))

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    pier: { x: 6 * tileSize, y: 121 * tileSize - 6 },
    citadelBeach: { x: (worldWidth - 6) * tileSize, y: 121 * tileSize - 6 }
  },
  state: {},
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  lightSources,
  objects,
  npcs: () => [
    new BearWhale(
      'bearWhale',
      {
        x: 70 * tileSize,
        y: 120 * tileSize
      }
    )
  ],
  items: () => [],
  events,
  assets: {
    wideRiver,
    moon,
    NPC,
    nakadaiMonarch,
    ferry,
    bearWhale,
    wave
  },
  track: () => 'surferJim',
  init: from => {
    const ferry = CTDLGAME.objects.find(obj => obj.id === 'ferry')

    if (!ferry && from) {
      CTDLGAME.objects.unshift(new Ferry(
        'ferry',
        {
          x: from === 'pier' ? 1 * tileSize - 4 : (worldWidth - 11) * tileSize,
          y: 118 * tileSize - 4,
          direction: from === 'pier' ? 'right' : 'left',
          vx: from === 'pier' ? 2 : -2
        }
      ))
    } else if (ferry && from) {
      ferry.x = from === 'pier' ? 1 * tileSize - 4 : (worldWidth - 11) * tileSize,
      ferry.drive(from === 'pier' ? 2 : -2)
    } else if (ferry) {
      ferry.drive(ferry.vx)
    }

    CTDLGAME.nakadaiMon.follow = false

    window.addEventListener('surferJim', e => {
      if (!e.detail) return
      setTextQueue([])
      addTextToQueue(e.detail)
    })
  },
  update: () => {
    const ferry = CTDLGAME.objects.find(obj => obj.id === 'ferry')

    if (ferry && ferry.x > (worldWidth - 10) * tileSize) {
      changeMap('citadel', 'wideRiver')
    } else if (ferry && ferry.x < 0 * tileSize) {
      changeMap('pier', 'wideRiver')
    }

    drawWaterBody((worldHeight - 2) * tileSize - 6)
  },
  canSetBlocks: false,
  overworld: true,
  spawnRates: {}
}


function drawWaterBody(waterHeight) {
  constants.fgContext.fillStyle = '#2a72bd'
  constants.fgContext.globalAlpha = 1
  constants.fgContext.beginPath()
  drawSine(
    constants.fgContext,
    CTDLGAME.viewport.x, CTDLGAME.viewport.x + constants.WIDTH + 1,
    waterHeight + 1,
    70, 1 + Math.sin(CTDLGAME.frame / 12) / 4, CTDLGAME.frame * 42
  )
  constants.fgContext.lineTo(CTDLGAME.viewport.x + constants.WIDTH + 1, worldHeight * tileSize)
  constants.fgContext.lineTo(CTDLGAME.viewport.x, worldHeight * tileSize)
  constants.fgContext.lineTo(CTDLGAME.viewport.x, waterHeight)
  constants.fgContext.fill()

  constants.fgContext.fillStyle = '#114071'
  drawCrispSine(
    constants.fgContext,
    CTDLGAME.viewport.x, CTDLGAME.viewport.x + constants.WIDTH + 1,
    waterHeight,
    70, 1 + Math.sin(CTDLGAME.frame / 12) / 4, CTDLGAME.frame * 42
  )

  constants.fgContext.fillStyle = '#185ea7'
  drawCrispSine(
    constants.fgContext,
    CTDLGAME.viewport.x, CTDLGAME.viewport.x + constants.WIDTH + 1,
    waterHeight + 1,
    68, 1 + Math.sin(CTDLGAME.frame / 12) / 4, CTDLGAME.frame * 42
  )

  constants.fgContext.fillStyle = '#3d7dbf'
  drawCrispSine(
    constants.fgContext,
    CTDLGAME.viewport.x, CTDLGAME.viewport.x + constants.WIDTH + 1,
    waterHeight + 1,
    72, 1 + Math.sin(CTDLGAME.frame / 12) / 4, CTDLGAME.frame * 42
  )

  let offset = Math.sin(CTDLGAME.frame / 96 + 40) * 30
  constants.fgContext.fillStyle = '#185ea7'
  drawCrispSine(
    constants.fgContext,
    CTDLGAME.viewport.x + 10 + offset, CTDLGAME.viewport.x + 40 + offset,
    waterHeight + 12,
    68, 1 - Math.sin(CTDLGAME.frame / 12) / 4, CTDLGAME.frame * 42
  )
  constants.fgContext.fillStyle = '#3d7dbf'
  drawCrispSine(
    constants.fgContext,
    CTDLGAME.viewport.x + 10 + offset, CTDLGAME.viewport.x + 40 + offset,
    waterHeight + 11,
    68, 1 - Math.sin(CTDLGAME.frame / 12) / 4, CTDLGAME.frame * 42
  )

  offset = Math.sin(CTDLGAME.frame / 108) * 30
  constants.fgContext.fillStyle = '#185ea7'
  drawCrispSine(
    constants.fgContext,
    CTDLGAME.viewport.x + 50 + offset, CTDLGAME.viewport.x + 80 + offset + 12 * Math.sin(CTDLGAME.frame / 103),
    waterHeight + 18,
    -65, 1 - Math.sin(CTDLGAME.frame / 12) / 4, CTDLGAME.frame * 42
  )
  constants.fgContext.fillStyle = '#3d7dbf'
  drawCrispSine(
    constants.fgContext,
    CTDLGAME.viewport.x + 50 + offset, CTDLGAME.viewport.x + 80 + offset + 12 * Math.sin(CTDLGAME.frame / 103),
    waterHeight + 17,
    -65, 1 - Math.sin(CTDLGAME.frame / 12) / 4, CTDLGAME.frame * 42
  )

  offset = Math.sin(CTDLGAME.frame / 132 - 32) * 30
  constants.fgContext.fillStyle = '#185ea7'
  drawCrispSine(
    constants.fgContext,
    CTDLGAME.viewport.x + 10 + offset, CTDLGAME.viewport.x + 40 + offset + 12 * Math.sin(CTDLGAME.frame / 99),
    waterHeight + 7,
    69, 1 + Math.sin(CTDLGAME.frame / 12) / 4, CTDLGAME.frame * 42
  )
  constants.fgContext.fillStyle = '#3d7dbf'
  drawCrispSine(
    constants.fgContext,
    CTDLGAME.viewport.x + 10 + offset, CTDLGAME.viewport.x + 40 + offset + 10 * Math.sin(CTDLGAME.frame / 99),
    waterHeight + 6,
    69, 1 + Math.sin(CTDLGAME.frame / 12) / 4, CTDLGAME.frame * 42
  )

}