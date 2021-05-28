import stage from './stage/pier'

import constants from '../../constants'
import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import { CTDLGAME } from '../../gameUtils'
import { makeBoundary } from '../../geometryUtils'
import { drawCrispSine, drawSine } from '../../geometryUtils/drawSineWave'
import getHitBoxes from '../getHitBoxes'
import parseLightSources from '../parseLightSources'
import Ferry from '../../objects/Ferry'
import FishingBoat from '../../objects/FishingBoat'

import pier from '../../sprites/pier.png'
import moon from '../../sprites/moon.png'
import NPC from '../../sprites/NPCs.png'
import nakadaiMonarch from '../../sprites/nakadaiMonarch.png'
import ferry from '../../sprites/ferry.png'
import fishingBoat from '../../sprites/fishingBoat.png'

const worldWidth = 64
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
  '5_1': {
    color: '#ebca09',
    brightness: .4,
    radius: 128
  }
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


const goToCapitalCity = new GameObject('goToCapitalCity', {
  x: 1 * tileSize,
  y: 121 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})
goToCapitalCity.touchEvent = () => {
  changeMap('capitalCity', 'pier')
}
events.push(goToCapitalCity)

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'pier', tileSize))

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    capitalCity: { x: 4 * tileSize, y: 121 * tileSize - 6 },
    wideRiver: { x: 16 * tileSize, y: 121 * tileSize - 6 }
  },
  state: {},
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  lightSources,
  objects,
  npcs: () => [
    new FishingBoat('fishingBoat', { x: 46 * tileSize - 4, y: 118 * tileSize - 4, context: 'bgContext' })
  ],
  items: () => [],
  events,
  assets: {
    pier,
    moon,
    NPC,
    nakadaiMonarch,
    ferry,
    fishingBoat
  },
  track: () => 'shore',
  init: from => {
    const ferry = CTDLGAME.objects.find(obj => obj.id === 'ferry')

    if (!ferry && from) {
      CTDLGAME.objects.push(new Ferry(
        'ferry',
        {
          x: 9 * tileSize - 4,
          y: 118 * tileSize - 4,
          direction: 'right'
        }
      ))
    } else if (from) {
      ferry.x = 9 * tileSize - 4
      ferry.direction = 'right'
      ferry.drive(0)
      ferry.stop()
    }

    if (ferry.vx !== 0 || !CTDLGAME.inventory.citadelOneMembership) CTDLGAME.nakadaiMon.follow = false
  },
  update: () => {
    const ferry = CTDLGAME.objects.find(obj => obj.id === 'ferry')

    if (ferry && ferry.x > (worldWidth - 10) * tileSize) {
      changeMap('wideRiver', 'pier')
    }
    if (ferry && ferry.x > (worldWidth - 45) * tileSize) {
      ferry.drive(2)
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