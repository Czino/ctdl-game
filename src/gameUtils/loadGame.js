import constants from '../constants'
import * as db from '../db'
import { CTDLGAME } from './CTDLGAME'
import Character from '../character'
import Block from '../block'
import Shitcoiner from '../shitcoiner'
import Item from '../item'
import { removeClass, addClass } from '../htmlUtils'
import { getTimeOfDay } from './getTimeOfDay'
import { initSoundtrack, startMusic } from '../soundtrack'

/**
 * @description Method to load game
 */
export const loadGame = async () => {
  let time = await db.get('time')

  let viewport = await db.get('viewport')
  let hodlonaut = await db.get('hodlonaut')
  let katoshi = await db.get('katoshi')
  let objects = await db.get('objects')
  let blockHeight = await db.get('blockHeight')
  let inventory = await db.get('inventory')
  let options = await db.get('options')

  if (time) CTDLGAME.frame = time
  if (viewport) {
    CTDLGAME.viewport = viewport
  }
  if (objects) {
    CTDLGAME.objects = objects.map(object => {
      if (object.class === 'Block') {
        return new Block(
          object.id,
          constants.gameContext,
          CTDLGAME.quadTree,
          object
        )
      } else if (object.class === 'Shitcoiner') {
        return new Shitcoiner(
          object.id,
          constants.gameContext,
          CTDLGAME.quadTree,
          object
        )
      } else if (object.class === 'Item') {
        return new Item(
          object.id,
          constants.gameContext,
          CTDLGAME.quadTree,
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
    constants.charContext,
    CTDLGAME.quadTree,
    hodlonaut
  )
  CTDLGAME.katoshi = new Character(
    'katoshi',
    constants.charContext,
    CTDLGAME.quadTree,
    katoshi
  )

  if (CTDLGAME.hodlonaut.selected) CTDLGAME.hodlonaut.select()
  if (CTDLGAME.katoshi.selected) CTDLGAME.katoshi.select()

  CTDLGAME.objects.push(CTDLGAME.hodlonaut)
  CTDLGAME.objects.push(CTDLGAME.katoshi)

  CTDLGAME.objects.forEach(object => CTDLGAME.quadTree.insert(object))
  CTDLGAME.objects.forEach(object => object.update())

  let timeOfDay = getTimeOfDay()
  if (timeOfDay > 18.5) {
    CTDLGAME.isNight = true
    removeClass(constants.gameCanvas, 'ctdl-day')
  } else if (timeOfDay > 5.5) {
    CTDLGAME.isNight = false
    addClass(constants.gameCanvas, 'ctdl-day')
  }

  initSoundtrack('stellaSplendence')
  startMusic()

  setTimeout(() => addClass(constants.gameCanvas, 'transition-background-color'))
}