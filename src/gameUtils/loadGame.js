import constants from '../constants'
import * as db from '../db'
import { CTDLGAME } from './CTDLGAME'
import Character from '../character'
import Block from '../block'
import Shitcoiner from '../shitcoiner'
import Brian from '../brian'
import Item from '../item'
import { removeClass, addClass } from '../htmlUtils'
import { getTimeOfDay } from './getTimeOfDay'
import { initSoundtrack, startMusic } from '../soundtrack'
import { updateViewport } from './updateViewport'

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
      if (object.class === 'Shitcoiner') {
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

  if (CTDLGAME.katoshi.selected) CTDLGAME.hodlonaut.select()
  if (CTDLGAME.katoshi.selected) CTDLGAME.katoshi.select()

  updateViewport()

  CTDLGAME.objects.push(CTDLGAME.hodlonaut)
  CTDLGAME.objects.push(CTDLGAME.katoshi)

  CTDLGAME.objects.forEach(object => CTDLGAME.quadTree.insert(object))
  CTDLGAME.objects.forEach(object => object.update())

  let timeOfDay = getTimeOfDay()
  if (timeOfDay > 18.5) {
    CTDLGAME.isNight = true
    removeClass(constants.skyCanvas, 'ctdl-day')
  } else if (timeOfDay > 5.5) {
    CTDLGAME.isNight = false
    addClass(constants.skyCanvas, 'ctdl-day')
  }

  initSoundtrack('stellaSplendence')
  if (CTDLGAME.options.music) startMusic()

  setTimeout(() => addClass(constants.skyCanvas, 'transition-background-color'))
}