import constants from '../constants'
import Shitcoiner from '../shitcoiner'
import { intersects } from '../geometryUtils'

export const spawnEnemies = () => {
  if (Math.random() < constants.SPAWNRATES.shitcoiner) {
    let shitcoiner = new Shitcoiner(
      'shitcoiner-' + Math.random(),
      constants.gameContext,
      window.CTDLGAME.quadTree, {
        x: window.CTDLGAME.viewport.x + Math.round(Math.random() * constants.WIDTH),
        y: constants.WORLD.h - constants.GROUNDHEIGHT - constants.MENU.h - 30,
        status: 'spawn'
      }
    )

    let hasCollided = window.CTDLGAME.quadTree.query(shitcoiner.getBoundingBox())
      .filter(point => point.isSolid && point.id !== shitcoiner.id)
      .some(point => intersects(shitcoiner.getBoundingBox(), point.getBoundingBox()))
    if (!hasCollided) window.CTDLGAME.objects.push(shitcoiner)
  }
}