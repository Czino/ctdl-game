import constants from '../constants'
import * as db from '../db'
import { CTDLGAME, setWorld } from './CTDLGAME'
import World from '../world'
import Character from '../character'
import { removeClass, addClass } from '../htmlUtils'
import { getTimeOfDay } from './getTimeOfDay'
import { initSoundtrack } from '../soundtrack'
import { updateViewport } from './updateViewport'
import { makeBoundary } from '../geometryUtils'
import { gameObjects } from './gameObjects'

/**
 * @description Method to load game
 * @returns {void}
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
      .filter(object => gameObjects[object.class])
      .map(object => new gameObjects[object.class](object.id, object))
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
  } else if (timeOfDay > 5.5) {
    CTDLGAME.isNight = false
  }

  initSoundtrack(CTDLGAME.world.map.track)
}