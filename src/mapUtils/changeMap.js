import constants from '../constants'
import { loadWorldObjects, saveGame } from '../gameUtils'
import { CTDLGAME, setWorld } from '../gameUtils/CTDLGAME'
import { makeBoundary } from '../geometryUtils'
import World from '../world'
import Block from '../block'
import Shitcoiner from '../shitcoiner'
import Brian from '../brian'
import Item from '../item'

export const changeMap = async (id, from) => {
  // save state before changing
  saveGame()

  const newWorld = new World(id)
  const objects = await loadWorldObjects()
  // Save state of old world
  CTDLGAME.objects = CTDLGAME.objects.filter(obj => obj.class === 'Character')

  setWorld(newWorld)

  // TODO move boundaries to map?
  CTDLGAME.objects.push(makeBoundary({ x: 0, y: 0, w: CTDLGAME.world.w, h: 12 }))
  CTDLGAME.objects.push(makeBoundary({ x: CTDLGAME.world.w - 12, y: 0, w: 12, h: CTDLGAME.world.h }))
  CTDLGAME.objects.push(makeBoundary({ x: 0, y: CTDLGAME.world.h - constants.GROUNDHEIGHT - constants.MENU.h, w: CTDLGAME.world.w, h: 12 }))
  CTDLGAME.objects.push(makeBoundary({ x: 0, y: 0, w: 12, h: CTDLGAME.world.h }))

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
  CTDLGAME.hodlonaut.x = newWorld.map.start[from].x - 10
  CTDLGAME.hodlonaut.y = newWorld.map.start[from].y
  CTDLGAME.katoshi.x = newWorld.map.start[from].x + 10
  CTDLGAME.katoshi.y = newWorld.map.start[from].y

  console.log('change map to ', id, newWorld.map)

  // save again the new map
  saveGame()

}

export default changeMap