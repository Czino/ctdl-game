import stage from './stage/craigsStage'

import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import Craig from '../../enemies/Craig'
import Wizard from '../../npcs/Wizard'
import { makeBoundary } from '../../geometryUtils'
import getHitBoxes from '../getHitBoxes'

import craigsStage from '../../sprites/craigsStage.png'
import craig from '../../sprites/craig.png'
import craigWithArmor from '../../sprites/craigWithArmor.png'
import wizard from '../../sprites/wizard.png'
import explosion from '../../sprites/explosion.png'
import moon from '../../sprites/moon.png'
import parseLightSources from '../parseLightSources'
import drawLightSources from '../drawLightSources'
import { CTDLGAME } from '../../gameUtils'
import constants from '../../constants'
import Character from '../../Character'
import { addTextToQueue } from '../../textUtils'
import Item from '../../objects/Item'
import { skipCutSceneButton } from '../../eventUtils'

const worldWidth = 64
const worldHeight = 64

const tileSize = 8

stage.parallax = parsePattern(stage.parallax, 0, 0)
stage.bg = parsePattern(stage.bg, 0, 0)
stage.base = parsePattern(stage.base, 0, 0)
stage.fg = parsePattern(stage.fg, 0, 0)
const ramps = [].map(tile => tile.toString())
const solids = [
  [1, 0], [1, 1], [2, 1], [3, 1],
  [2, 2],
  [4, 6],
  [5, 9], [5, 10],
  [6, 1], [6, 2], [6, 5],
  [7, 1], [7, 2], [7, 6]
].map(tile => tile.toString())
const spawnPoints = [
  [6, 1]
].map(tile => tile.toString())
const lights = {
  '6_8': {
    color: '#dd8124',
    brightness: .3,
    radius: 64
  }
}
let lightSources = parseLightSources(lights, stage.base, tileSize)
  .map(light => ({
    ...light,
    y: light.y + tileSize / 2
  }))

let objects = []
let events = []
let lightning = false
let katoshisWrath = false

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

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'craigsStage', tileSize))

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    craigsCastle: { x: 16 * tileSize, y: 60 * tileSize - 3}
  },
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  objects,
  npcs: () => [
    new Craig(
      'craig',
      {
        x: 38 * tileSize,
        y: 60 * tileSize - 2,
        hasArmor: true
      }
    )
  ],
  items: () => [],
  lightSources,
  events,
  assets: {
    craigsStage,
    craig,
    craigWithArmor,
    moon,
    explosion,
    wizard
  },
  bgColor: () => '#000',
  init: () => {
    if (CTDLGAME.hodlonaut.status === 'rekt') katoshisWrath = true
    const craig = CTDLGAME.objects.find(obj => obj.id === 'craig')

    if (craig && craig.hadIntro) return
  
    CTDLGAME.katoshi.x = 15 * 8
    CTDLGAME.hodlonaut.x = 17.5 * 8
    CTDLGAME.lockCharacters = true
    skipCutSceneButton.active = true

    CTDLGAME.hodlonaut.direction = 'left'
    addTextToQueue('*locks gate*', () => {
      window.SOUND.playSound('block')
      window.SOUND.playSound('clunk')
    })
    addTextToQueue('hodlonaut:\nKatia, I can\'t allow him to\nhurt you.')
    addTextToQueue('hodlonaut:\nI need to face him alone.', () => {

      CTDLGAME.preventCharacterSwitch = true
      CTDLGAME.katoshi.follow = false
      CTDLGAME.katoshi.select = () => {
        if (CTDLGAME.inventory.sats > 1 * 100000000) return

        addTextToQueue('katoshi: Take my Bitcoin,\nanything that can help.', () => {
          CTDLGAME.inventory.sats += 1.8 * 100000000
        })
      }
      CTDLGAME.lockCharacters = false
      skipCutSceneButton.active = false
    })
  },
  update: () => {
    const craig = CTDLGAME.objects.find(obj => obj.id === 'craig')

    if (Math.random() < .03) lightning = 4

    if (lightning) {
      constants.skyContext.fillStyle = '#FFF'
      constants.skyContext.globalAlpha = lightning / 4
      constants.skyContext.fillRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
      constants.skyContext.globalAlpha = 1
      lightning--
    }
    drawLightSources(lightSources, 'craigsStage', tileSize, 1, false)

    if (craig && CTDLGAME.hodlonaut.says.length > 0 && CTDLGAME.hodlonaut.says[0].say === 'help!' && CTDLGAME.hodlonaut.status !== 'rekt') {

      if (craig.hitsToSuckUp === 0) {
        CTDLGAME.objects.push(new Item(
          'steak',
          {
            x: CTDLGAME.viewport.x - 20 > 18 * tileSize ? CTDLGAME.viewport.x - 20 : CTDLGAME.viewport.x + constants.WIDTH,
            y: CTDLGAME.hodlonaut.y
          }
        ))
        addTextToQueue('#weAreAllHodlonaut')
      }

      CTDLGAME.objects.push(new Character(
        'hodlonaut-' + CTDLGAME.frame,
        {
          x: CTDLGAME.viewport.x - 20 > 18 * tileSize ? CTDLGAME.viewport.x - 20 : CTDLGAME.viewport.x + constants.WIDTH,
          y: CTDLGAME.hodlonaut.y,
          senseRadius: constants.WIDTH * 2,
          walkingSpeed: Math.round(Math.random() * 3 + 2),
          oneHitWonder: true
        }
      ))
      craig.hitsToSuckUp++
      if (craig.hitsToSuckUp > 3) craig.hitsToSuckUp = 3
    }

    if (!katoshisWrath && CTDLGAME.hodlonaut.status === 'rekt') {
      CTDLGAME.katoshi.x = 17.5 * 8
      CTDLGAME.katoshi.say('you bastard!')
      window.SNDTRCK.initSoundtrack('hurry')
      katoshisWrath = true
      CTDLGAME.objects = CTDLGAME.objects.filter(obj => !obj.oneHitWonder)
    }
    if (craig && craig.status === 'rekt') {
      const wizard = CTDLGAME.objects.find(obj => obj.id === 'wizard')
      if (!wizard && craig.protection === 0) {
        CTDLGAME.preventCharacterSwitch = false
        CTDLGAME.objects.push(new Wizard(
          'wizard',
          {
            x: window.SELECTEDCHARACTER.x - 40,
            y: window.SELECTEDCHARACTER.y - 4,
            craigRekt: true
          }
        ))
        if (CTDLGAME.hodlonaut === 'rekt') CTDLGAME.hodlonaut.revive(21)
        CTDLGAME.katoshi.x = CTDLGAME.viewport.x - 20
        CTDLGAME.katoshi.follow = true
        CTDLGAME.objects = CTDLGAME.objects.filter(obj => !obj.oneHitWonder)
        window.SNDTRCK.initSoundtrack('singlePoint')
      } else {
        craig.protection--
      }
    }
  },
  track: () => 'craigsCastle',
  canSetBlocks: false,
  overworld: false,
  spawnRates: {}
}