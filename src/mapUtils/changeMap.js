import constants from '../constants'
import { loadWorldObjects, saveGame, updateViewport } from '../gameUtils'
import { CTDLGAME, setWorld } from '../gameUtils/CTDLGAME'
import { makeBoundary } from '../geometryUtils'
import World from '../world'
import Block from '../block'
import Shitcoiner from '../shitcoiner'
import Rabbit from '../rabbit'
import Brian from '../brian'
import Item from '../item'
import { initSoundtrack } from '../soundtrack'

export const changeMap = async (id, from) => {
  // save state before changing
  if (from !== 'newGame') await saveGame()

  const newWorld = new World(id)
  const objects = from !== 'newGame' ? await loadWorldObjects(id) : null
  // Save state of old world

  CTDLGAME.objects = CTDLGAME.objects.filter(obj => obj.class === 'Character' || obj.backEvent || obj.touchEvent)

  setWorld(newWorld)

  CTDLGAME.objects.push(makeBoundary({ x: 0, y: 0, w: CTDLGAME.world.w, h: 12 }))
  CTDLGAME.objects.push(makeBoundary({ x: CTDLGAME.world.w - 12, y: 0, w: 12, h: CTDLGAME.world.h }))
  CTDLGAME.objects.push(makeBoundary({ x: 0, y: CTDLGAME.world.h - constants.GROUNDHEIGHT - constants.MENU.h, w: CTDLGAME.world.w, h: 12 }))
  CTDLGAME.objects.push(makeBoundary({ x: 0, y: 0, w: 12, h: CTDLGAME.world.h }))

  if (objects) {
    objects
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
        } else if (object.class === 'Item') {
          return new Item(
            object.id,
            object
          )
        }
      })
    .map(object => CTDLGAME.objects.push(object))
  } else {
    CTDLGAME.world.map.objects
    .filter(object => object.enemy)
    .map(object => CTDLGAME.objects.push(object))
  }

  CTDLGAME.world.map.objects
    .filter(object => !object.class || object.class === 'Ramp')
    .map(object => CTDLGAME.objects.push(object))

  CTDLGAME.hodlonaut.x = newWorld.map.start[from].x - 5
  CTDLGAME.hodlonaut.y = newWorld.map.start[from].y
  CTDLGAME.katoshi.x = newWorld.map.start[from].x + 5
  CTDLGAME.katoshi.y = newWorld.map.start[from].y

  updateViewport()
  initSoundtrack(newWorld.map.track)
  // save again the new map
  if (from !== 'newGame') await saveGame()
}

export default changeMap