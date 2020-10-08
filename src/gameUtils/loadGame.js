import constants from '../constants'
import * as db from '../db'
import { CTDLGAME, setWorld } from './CTDLGAME'
import World from '../world'
import Character from '../character'
import Block from '../block'
import Shitcoiner from '../shitcoiner'
import Rabbit from '../rabbit'
import Bear from '../bear'
import Brian from '../brian'
import NPC from '../npc'
import Item from '../item'
import { removeClass, addClass } from '../htmlUtils'
import { getTimeOfDay } from './getTimeOfDay'
import { initSoundtrack } from '../soundtrack'
import { updateViewport } from './updateViewport'
import { makeBoundary } from '../geometryUtils'

/**
 * @description Method to load game
 */
export const loadGame = async () => {
  let time = await db.get('time')
  let worldId = await db.get('worldId')

  let hodlonaut = await db.get('hodlonaut')
  let katoshi = await db.get('katoshi')
  let objects = await db.get(`objects-${worldId}`)
  let blockHeight = await db.get('blockHeight')
  let inventory = await db.get('inventory')
  let options = await db.get('options')

  if (time) CTDLGAME.frame = time

  if (objects) {
    CTDLGAME.objects = objects
      .map(object => {
      if (object.class === 'Block') {
        return new Block(
          object.id,
          constants.gameContext,
          object
        )
      } else if (object.class === 'Shitcoiner') {
        return new Shitcoiner(
          object.id,
          object
        )
      } else if (object.class === 'Rabbit') {
        return new Rabbit(
          object.id,
          object
        )
      } else if (object.class === 'Brian') {
        return new Brian(
          object.id,
          object
        )
      } else if (object.class === 'Bear') {
        return new Bear(
          object.id,
          object
        )
      } else if (object.class === 'Item') {
        return new Item(
          object.id,
          object
        )
      } else if (object.class === 'NPC') {
        return new NPC(
          object.id,
          object
        )
      }
    })
  }

  setWorld(new World(worldId))

  if (CTDLGAME.objects.length === 0) {
    CTDLGAME.objects = CTDLGAME.world.map.objects
  } else {
    CTDLGAME.world.map.objects
      .filter(object => !object.class || object.class === 'Ramp')
      .map(object => CTDLGAME.objects.push(object))
  }

  CTDLGAME.objects.push(makeBoundary({ x: 0, y: 0, w: CTDLGAME.world.w, h: 12 }))
  CTDLGAME.objects.push(makeBoundary({ x: CTDLGAME.world.w - 12, y: 0, w: 12, h: CTDLGAME.world.h }))
  CTDLGAME.objects.push(makeBoundary({ x: 0, y: CTDLGAME.world.h - constants.GROUNDHEIGHT - constants.MENU.h, w: CTDLGAME.world.w, h: 12 }))
  CTDLGAME.objects.push(makeBoundary({ x: 0, y: 0, w: 12, h: CTDLGAME.world.h }))

  if (blockHeight) CTDLGAME.blockHeight = blockHeight
  if (inventory) CTDLGAME.inventory = inventory
  if (options) CTDLGAME.options = options

  CTDLGAME.hodlonaut = new Character(
    'hodlonaut',
    hodlonaut
  )
  CTDLGAME.katoshi = new Character(
    'katoshi',
    katoshi
  )

  if (CTDLGAME.hodlonaut.selected) CTDLGAME.hodlonaut.select()
  if (CTDLGAME.katoshi.selected) CTDLGAME.katoshi.select()

  updateViewport()

  CTDLGAME.objects.push(CTDLGAME.hodlonaut)
  CTDLGAME.objects.push(CTDLGAME.katoshi)

  CTDLGAME.objects.forEach(object => {
    CTDLGAME.quadTree.insert(object)
  })

  let timeOfDay = getTimeOfDay()
  if (timeOfDay > 18.5) {
    CTDLGAME.isNight = true
    removeClass(constants.skyCanvas, 'ctdl-day')
  } else if (timeOfDay > 5.5) {
    CTDLGAME.isNight = false
    addClass(constants.skyCanvas, 'ctdl-day')
  }

  initSoundtrack(CTDLGAME.world.map.track)

  setTimeout(() => addClass(constants.skyCanvas, 'transition-background-color'))
}