import { loadWorldObjects, saveGame, updateViewport, gameObjects } from '../gameUtils'
import { CTDLGAME, setWorld } from '../gameUtils/CTDLGAME'
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

  if (objects && objects.length > 0) {
    objects
      .filter(object => gameObjects[object.class])
      .map(object => new gameObjects[object.class](object.id, object))
      .map(object => CTDLGAME.objects.push(object))
  } else {
    CTDLGAME.world.map.npcs().map(object => CTDLGAME.objects.push(object))
    CTDLGAME.world.map.items().map(object => CTDLGAME.objects.push(object))
  }

  CTDLGAME.world.map.objects
    .filter(object => !object.class || object.class === 'Ramp')
    .map(object => CTDLGAME.objects.push(object))

  // prevent object falling into the floor
  CTDLGAME.objects
    .filter(obj => obj.applyGravity)
    .map(obj => obj.vy = -2)

  CTDLGAME.hodlonaut.x = newWorld.map.start[from].x - 3
  CTDLGAME.hodlonaut.y = newWorld.map.start[from].y
  CTDLGAME.hodlonaut.protection = 24
  CTDLGAME.katoshi.x = newWorld.map.start[from].x + 3
  CTDLGAME.katoshi.y = newWorld.map.start[from].y
  CTDLGAME.katoshi.protection = 24

  updateViewport()
  initSoundtrack(newWorld.map.track)
  // save again the new map
  if (from !== 'newGame') await saveGame()
}

export default changeMap