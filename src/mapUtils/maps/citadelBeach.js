import stage from './stage/citadelBeach'

import constants from '../../constants'
import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import { CTDLGAME } from '../../gameUtils'
import { makeBoundary } from '../../geometryUtils'
import { drawCrispSine, drawSine } from '../../geometryUtils/drawSineWave'
import { addTextToQueue, setTextQueue } from '../../textUtils'
import getHitBoxes from '../getHitBoxes'
import parseLightSources from '../parseLightSources'
import Ferry from '../../objects/Ferry'
import BlueMoon from '../../npcs/BlueMoon'
import Chappie from '../../npcs/Chappie'
import HODLvirus from '../../npcs/HODLvirus'
import GlennHodl from '../../npcs/GlennHodl'
import ChrisWhodl from '../../npcs/ChrisWhodl'
import Vlad from '../../npcs/Vlad'
import JoseSBam from '../../npcs/JoseSBam'
import Bitdov from '../../npcs/Bitdov'
import NPC from '../../npcs/NPC'

import citadelBeach from '../../sprites/citadelBeach.png'
import moon from '../../sprites/moon.png'
import nakadaiMonarch from '../../sprites/nakadaiMonarch.png'
import ferry from '../../sprites/ferry.png'
import blueMoon from '../../sprites/blueMoon.png'
import chappie from '../../sprites/chappie.png'
import hodlVirus from '../../sprites/hodlVirus.png'
import bitdov from '../../sprites/bitdov.png'
import glennHodl from '../../sprites/glennHodl.png'
import chrisWhodl from '../../sprites/chrisWhodl.png'
import vlad from '../../sprites/vlad.png'
import joseSBam from '../../sprites/joseSBam.png'

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
    ),
    new HODLvirus(
      'hodlVirus',
      {
        x: 66 * tileSize,
        y: 123 * tileSize,
        context: 'fgContext'
      }
    ),
    new Bitdov(
      'bitdov',
      {
        x: 70 * tileSize,
        y: 121 * tileSize,
        context: 'fgContext'
      }
    ),
    new NPC(
      'cryptoCrab',
      {
        x: 53 * tileSize,
        y: 125 * tileSize,
        context: 'fgContext'
      }
    ),
    new NPC(
      'lokul',
      {
        x: 56 * tileSize + 4,
        y: 120 * tileSize,
        context: 'gameContext'
      }
    ),
    new JoseSBam(
      'joseSBam',
      {
        x: 53 * tileSize + 4,
        y: 120 * tileSize - 3,
        context: 'gameContext'
      }
    ),
    // new Vlad(
    //   'vlad',
    //   {
    //     x: 89 * tileSize,
    //     y: 118 * tileSize - 4,
    //     context: 'bgContext'
    //   }
    // ),
    // new GlennHodl(
    //   'glennHodl',
    //   {
    //     x: 89 * tileSize,
    //     y: 117 * tileSize + 4,
    //     context: 'bgContext'
    //   }
    // ),
    // new ChrisWhodl(
    //   'chrisWhodl',
    //   {
    //     x: 91 * tileSize,
    //     y: 117 * tileSize + 4,
    //     context: 'bgContext'
    //   }
    // )
  ],
  items: () => [],
  events,
  assets: {
    citadelBeach,
    moon,
    nakadaiMonarch,
    ferry,
    blueMoon,
    chappie,
    hodlVirus,
    bitdov,
    glennHodl,
    chrisWhodl,
    vlad,
    joseSBam,
  },
  track: () => 'lambada',
  init: from => {
    const ferry = CTDLGAME.objects.find(obj => obj.id === 'ferry')
    const glennHodl = CTDLGAME.objects.find(obj => obj.id === 'glennHodl')
    const chrisWhodl = CTDLGAME.objects.find(obj => obj.id === 'chrisWhodl')
    const vlad = CTDLGAME.objects.find(obj => obj.id === 'vlad')
    let lyricsDiamondLights = [
      'Glenn and Chris:\nEyes that freeze like ice',
      'Glenn and Chris:\nCold electric blue those\nlaser eyes',
      'Glenn and Chris:\nYou are hard as stone',
      'Glenn and Chris:\nSolid stone',
      'Glenn and Chris:\nfor me',
      'Glenn and Chris:\nThe money change rearrange my life',
      'Glenn and Chris:\nCan\'t explain so pumped\ntonight',
      'Glenn and Chris:\nDarling I love you,\n(the shades come off)',
      'Glenn and Chris:\nI\'ll always want you',
      'Glenn and Chris:\nDarling I love you,\n(laser ray until 100K)',
      'Glenn and Chris:\nI\'ll always need you',
      'Glenn and Chris:\nOh darling',
      'Glenn and Chris:\nLaser, laser eyes',
      'Glenn and Chris:\nStanding in the rain',
      'Glenn and Chris:\nCold electric sky\nno laser eyes',
      'Glenn and Chris:\nNow I\'m on my own',
      'Glenn and Chris:\nSo alone',
      'Glenn and Chris:\noh darling',

      'Glenn and Chris:\nLaser eyes',
      'Glenn and Chris:\ncold as ice to me ',
      'Glenn and Chris:\nLaser eyes',
      'Glenn and Chris:\ncold as ice to me',

      'Glenn and Chris:\nDarling I love you,\n(my laser eyes)',
      'Glenn and Chris:\nI\'ll always want you',
      'Glenn and Chris:\nDarling I love you,\n(my laser eyes)',
      'Glenn and Chris:\nI\'ll always need you',
      'Glenn and Chris:\noh darling',

      'Glenn and Chris:\nLaser eyes',
      'Glenn and Chris:\ncold as ice to me\n(cold as ice to me',
      'Glenn and Chris:\nLaser eyes',
      'Glenn and Chris:\ncold as ice to me\n(cold as ice to me',

      'Glenn and Chris:\nDarling I love you,\n(my laser eyes)',
      'Glenn and Chris:\nI\'ll always need you',
      'Glenn and Chris:\nDarling I love you,\n(my laser eyes)',
      'Glenn and Chris:\nI\'ll always need you',
      'Glenn and Chris:\nDarling I love you,\n(my laser eyes)',
      'Glenn and Chris:\nI\'ll always want you',
      'Glenn and Chris:\nDarling I love you,\n(my laser eyes)',
      'Glenn and Chris:\nI\'ll always need you'
    ]
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

    window.addEventListener('toggleSoundtrack', () => {
      glennHodl.status = 'idle'
      chrisWhodl.status = 'idle'
      if (lyricsDiamondLights.length > 0) {
        setTextQueue([])
        lyricsDiamondLights = []
      }
    })
    window.addEventListener('diamondLights', e => {
      if (glennHodl.status === 'idle') return
      glennHodl.status = e.detail
      chrisWhodl.status = e.detail
      if (e.detail === 'move' && lyricsDiamondLights.length > 0) {
        setTextQueue([])
        addTextToQueue(lyricsDiamondLights.shift())
      }
    })
    window.addEventListener('johnnyBGoode', e => {
      if (vlad.status === 'idle') return
      if (!e.detail) return
      vlad.direction = e.detail.direction
      vlad.status = e.detail.status
    })
  },
  update: () => {
    const ferry = CTDLGAME.objects.find(obj => obj.id === 'ferry')

    if (ferry && ferry.vx && ferry.x < -6 * tileSize) {
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

    window.SNDTRCK.changeVolume(
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