import constants from '../constants'
import { loadWorldObjects, saveGame, updateViewport, gameObjects } from '../gameUtils'
import { CTDLGAME, setWorld } from '../gameUtils/CTDLGAME'
import { makeBoundary } from '../geometryUtils'
import World from '../World'
import { initSoundtrack } from '../soundtrack'

/**
 * @description Method to fascilitate changing of maps
 * @param {String} id world id
 * @param {String} from world id
 * @returns {void}
 */
export const changeMap = async (id, from) => {
  // save state before changing
  if (from !== 'newGame') await saveGame()

  // remove all objects but characters
  CTDLGAME.objects = CTDLGAME.objects.filter(obj => obj.class === 'Character')

  // create new world
  const newWorld = new World(id)
  const objects = from !== 'newGame' ? await loadWorldObjects(id) : null
  // Save state of old world


  setWorld(newWorld)

  CTDLGAME.objects.push(makeBoundary({ x: 0, y: 0, w: CTDLGAME.world.w, h: 12 }))
  CTDLGAME.objects.push(makeBoundary({ x: CTDLGAME.world.w - 12, y: 0, w: 12, h: CTDLGAME.world.h }))
  CTDLGAME.objects.push(makeBoundary({ x: 0, y: CTDLGAME.world.h - constants.GROUNDHEIGHT - constants.MENU.h, w: CTDLGAME.world.w, h: 12 }))
  CTDLGAME.objects.push(makeBoundary({ x: 0, y: 0, w: 12, h: CTDLGAME.world.h }))

  if (objects) {
    objects
    .filter(object => gameObjects[object.class])
    .map(object => new gameObjects[object.class](object.id, object))
    .map(object => CTDLGAME.objects.push(object))
  } else {
    CTDLGAME.world.map.objects
      .filter(object => object.enemy || object.class === 'NPC')
      .map(object => CTDLGAME.objects.push(object))
  }

  CTDLGAME.world.map.objects
    .filter(object => !object.class || object.class === 'Ramp')
    .map(object => CTDLGAME.objects.push(object))

  CTDLGAME.hodlonaut.x = newWorld.map.start[from].x - 5
  CTDLGAME.hodlonaut.y = newWorld.map.start[from].y
  CTDLGAME.hodlonaut.teleporting = 24
  CTDLGAME.katoshi.x = newWorld.map.start[from].x + 5
  CTDLGAME.katoshi.y = newWorld.map.start[from].y
  CTDLGAME.katoshi.teleporting = 24

  updateViewport()
  initSoundtrack(newWorld.map.track)
  // save again the new map
  if (from !== 'newGame') await saveGame()
}

export default changeMap