import constants from '../constants'
import * as db from '../db'
import { CTDLGAME } from './CTDLGAME'
import Tiles from '../tiles'
import Character from '../character'
import Block from '../block'
import Shitcoiner from '../shitcoiner'
import Brian from '../brian'
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

  let hodlonaut = await db.get('hodlonaut')
  let katoshi = await db.get('katoshi')
  let objects = await db.get('objects')
  let blockHeight = await db.get('blockHeight')
  let inventory = await db.get('inventory')
  let options = await db.get('options')

  if (time) CTDLGAME.frame = time

  CTDLGAME.world = constants.WORLD
  if (objects) {
    CTDLGAME.objects = objects.map(object => {
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
      } else if (object.class === 'Brian') {
        return new Brian(
          object.id,
          object
        )
      } else if (object.class === 'Item') {
        return new Item(
          object.id,
          object
        )
      }
    })
  }


  CTDLGAME.objects.push(makeBoundary({ x: 0, y: 0, w: CTDLGAME.world.w, h: 12 }))
  CTDLGAME.objects.push(makeBoundary({ x: CTDLGAME.world.w - 12, y: 0, w: 12, h: CTDLGAME.world.h }))
  CTDLGAME.objects.push(makeBoundary({ x: 0, y: CTDLGAME.world.h - constants.GROUNDHEIGHT - constants.MENU.h, w: CTDLGAME.world.w, h: 12 }))
  CTDLGAME.objects.push(makeBoundary({ x: 0, y: 0, w: 12, h: CTDLGAME.world.h }))

  CTDLGAME.tiles = new Tiles('city')

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

  CTDLGAME.objects.forEach(object => CTDLGAME.quadTree.insert(object))

  let timeOfDay = getTimeOfDay()
  if (timeOfDay > 18.5) {
    CTDLGAME.isNight = true
    removeClass(constants.skyCanvas, 'ctdl-day')
  } else if (timeOfDay > 5.5) {
    CTDLGAME.isNight = false
    addClass(constants.skyCanvas, 'ctdl-day')
  }

  initSoundtrack('stellaSplendence')

  setTimeout(() => addClass(constants.skyCanvas, 'transition-background-color'))
}