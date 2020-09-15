import constants from '../constants'
import * as db from '../db'
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

  if (time) window.CTDLGAME.frame = time
  if (viewport) {
    window.CTDLGAME.viewport = viewport
  }
  if (objects) {
    window.CTDLGAME.objects = objects.map(object => {
      if (object.class === 'Block') {
        return new Block(
          object.id,
          constants.gameContext,
          window.CTDLGAME.quadTree,
          object
        )
      } else if (object.class === 'Shitcoiner') {
        return new Shitcoiner(
          object.id,
          constants.gameContext,
          window.CTDLGAME.quadTree,
          object
        )
      } else if (object.class === 'Item') {
        return new Item(
          object.id,
          constants.gameContext,
          window.CTDLGAME.quadTree,
          object
        )
      }
    })
  }
  if (blockHeight) window.CTDLGAME.blockHeight = blockHeight
  if (inventory) window.CTDLGAME.inventory = inventory
  if (options) window.CTDLGAME.options = options

  window.CTDLGAME.hodlonaut = new Character(
    'hodlonaut',
    constants.charContext,
    window.CTDLGAME.quadTree,
    hodlonaut
  )
  window.CTDLGAME.katoshi = new Character(
    'katoshi',
    constants.charContext,
    window.CTDLGAME.quadTree,
    katoshi
  )

  if (window.CTDLGAME.hodlonaut.selected) window.CTDLGAME.hodlonaut.select()
  if (window.CTDLGAME.katoshi.selected) window.CTDLGAME.katoshi.select()

  window.CTDLGAME.objects.push(window.CTDLGAME.hodlonaut)
  window.CTDLGAME.objects.push(window.CTDLGAME.katoshi)

  window.CTDLGAME.objects.forEach(object => window.CTDLGAME.quadTree.insert(object))
  window.CTDLGAME.objects.forEach(object => object.update())

  let timeOfDay = getTimeOfDay()
  if (timeOfDay > 18.5) {
    window.CTDLGAME.isNight = true
    removeClass(constants.gameCanvas, 'ctdl-day')
  } else if (timeOfDay > 5.5) {
    window.CTDLGAME.isNight = false
    addClass(constants.gameCanvas, 'ctdl-day')
  }

  initSoundtrack('stellaSplendence')
  startMusic()

  setTimeout(() => addClass(constants.gameCanvas, 'transition-background-color'))
}