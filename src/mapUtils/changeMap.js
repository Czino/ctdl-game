import constants from '../constants'
import { CTDLGAME, setWorld } from '../gameUtils/CTDLGAME'
import { makeBoundary } from '../geometryUtils'
import World from '../world'

export const changeMap = (id, from) => {
  const newWorld = new World(id)

  // Save state of old world
  CTDLGAME.objects = CTDLGAME.objects.filter(obj => obj.class === 'Character')

  // TODO move boundaries to map?
  CTDLGAME.objects.push(makeBoundary({ x: 0, y: 0, w: CTDLGAME.world.w, h: 12 }))
  CTDLGAME.objects.push(makeBoundary({ x: CTDLGAME.world.w - 12, y: 0, w: 12, h: CTDLGAME.world.h }))
  CTDLGAME.objects.push(makeBoundary({ x: 0, y: CTDLGAME.world.h - constants.GROUNDHEIGHT - constants.MENU.h, w: CTDLGAME.world.w, h: 12 }))
  CTDLGAME.objects.push(makeBoundary({ x: 0, y: 0, w: 12, h: CTDLGAME.world.h }))

  CTDLGAME.hodlonaut.x = newWorld.map.start[from].x - 10
  CTDLGAME.hodlonaut.y = newWorld.map.start[from].y
  CTDLGAME.katoshi.x = newWorld.map.start[from].x + 10
  CTDLGAME.katoshi.y = newWorld.map.start[from].y

  console.log('change map to ', id, newWorld.map)

  setWorld(newWorld)
}

export default changeMap