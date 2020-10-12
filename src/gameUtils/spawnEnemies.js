import constants from '../constants'
import Shitcoiner from '../shitcoiner'
import Rabbit from '../rabbit'
import { CTDLGAME } from './CTDLGAME'
import { intersects } from '../geometryUtils'

/**
 * @description Method that takes care of spawning enemies according to spawn rate and world
 * @returns {void}
 */
export const spawnEnemies = () => {
  if (CTDLGAME.isNight && Math.random() < constants.SPAWNRATES.shitcoiner[CTDLGAME.world.id]) {
    // TODO maybe spawn shitcoiners like rabbits
    // TODO maybe consider iterating through worldObects
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
  if (Math.random() < constants.SPAWNRATES.rabbit[CTDLGAME.world.id]) {
    let rabbit = new Rabbit(
      'rabbit-' + Math.random(),
      {
        x: CTDLGAME.viewport.x + Math.round(Math.random() * constants.WIDTH),
        y: CTDLGAME.world.h - constants.GROUNDHEIGHT - constants.MENU.h,
        status: 'spawn'
      }
    )

    // spawn extra high and test down until ground is found
    let spawned = false
    do {
      let hasCollided = CTDLGAME.quadTree.query(rabbit.getBoundingBox())
        .filter(point => point.isSolid && point.id !== rabbit.id)
        .some(point => intersects(rabbit.getBoundingBox(), point.getBoundingBox()))

      if (!hasCollided) {
        spawned = true
        CTDLGAME.objects.push(rabbit)
      } else {
        rabbit.y -= 1
      }
    } while (!spawned && rabbit.y > 0)
  }
}