import constants from '../constants'
import Shitcoiner from '../shitcoiner'
import { CTDLGAME } from './CTDLGAME'
import { intersects } from '../geometryUtils'

export const spawnEnemies = () => {
  if (Math.random() < constants.SPAWNRATES.shitcoiner[CTDLGAME.world.id]) {
    let shitcoiner = new Shitcoiner(
      'shitcoiner-' + Math.random(),
      {
        x: CTDLGAME.viewport.x + Math.round(Math.random() * constants.WIDTH),
        y: CTDLGAME.world.h - constants.GROUNDHEIGHT - constants.MENU.h - 30,
        status: 'spawn'
      }
    )

    let hasCollided = CTDLGAME.quadTree.query(shitcoiner.getBoundingBox())
      .filter(point => point.isSolid && point.id !== shitcoiner.id)
      .some(point => intersects(shitcoiner.getBoundingBox(), point.getBoundingBox()))
    if (!hasCollided) CTDLGAME.objects.push(shitcoiner)
  }
}