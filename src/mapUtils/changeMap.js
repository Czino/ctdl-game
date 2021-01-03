import { loadWorldObjects, saveGame, updateViewport, gameObjects, loadWorldState } from '../gameUtils'
import { CTDLGAME, setWorld } from '../gameUtils/CTDLGAME'
import World from '../World'
import { initSoundtrack } from '../soundtrack'
import { loadMap } from './loadMap'

/**
 * @description Method to fascilitate changing of maps
 * @param {String} id world id
 * @param {String} from world id
 * @returns {void}
 */
export const changeMap = async (id, from) => {
  if (CTDLGAME.world && !CTDLGAME.world.ready) return
  // save state before changing

  if (from !== 'newGame') await saveGame()

  // remove all objects but characters
  CTDLGAME.objects = CTDLGAME.objects.filter(obj => obj.class === 'Character')

  // create new world
  const newWorld = new World(id, await loadMap(id))
  const objects = from !== 'newGame' ? await loadWorldObjects(id) : null
  const worldState = from !== 'newGame' ? await loadWorldState(id) : null

  // Save state of old world

  setWorld(newWorld)
  CTDLGAME.world.ready = false

  if (worldState) CTDLGAME.world.map.state = worldState;

  if (objects && objects.length > 0) {
    // we have saved objects, let's initialize them
    objects
      .filter(object => gameObjects[object.class])
      .map(object => new gameObjects[object.class](object.id, object))
      .map(object => CTDLGAME.objects.push(object))
  } else {
    // we have no objects saved, let's get the default ones
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

  if (CTDLGAME.hodlonaut.health > 0) {
    CTDLGAME.hodlonaut.x = newWorld.map.start[from].x - 3
    CTDLGAME.hodlonaut.y = newWorld.map.start[from].y
    CTDLGAME.hodlonaut.protection = 24
  }
  if (CTDLGAME.katoshi.health > 0) {
    CTDLGAME.katoshi.x = newWorld.map.start[from].x + 3
    CTDLGAME.katoshi.y = newWorld.map.start[from].y
    CTDLGAME.katoshi.protection = 24
  }

  if (CTDLGAME.world.map.init) CTDLGAME.world.map.init()
  updateViewport()

  initSoundtrack(newWorld.map.track())
  // save again the new map
  if (from !== 'newGame') await saveGame()
}

export default changeMap