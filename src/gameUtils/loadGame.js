import * as db from '../db'
import { CTDLGAME, setWorld } from './CTDLGAME'
import World from '../World'
import Character from '../Character'
import { getTimeOfDay } from './getTimeOfDay'
import { initSoundtrack } from '../soundtrack'
import { updateViewport } from './updateViewport'
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

  if (CTDLGAME.hodlonaut.selected) window.SELECTEDCHARACTER = CTDLGAME.hodlonaut
  if (CTDLGAME.katoshi.selected) window.SELECTEDCHARACTER = CTDLGAME.katoshi

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