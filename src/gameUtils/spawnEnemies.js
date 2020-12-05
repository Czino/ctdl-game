import constants from '../constants'
import Shitcoiner from '../enemies/Shitcoiner'
import Rabbit from '../enemies/Rabbit'
import Goldbugs from '../enemies/Goldbugs'
import { CTDLGAME } from './CTDLGAME'
import { intersects } from '../geometryUtils'

/**
 * @description Method that takes care of spawning enemies according to spawn rate and world
 * @returns {void}
 */
export const spawnEnemies = () => {
  if (CTDLGAME.isNight && Math.random() < CTDLGAME.world.map.spawnRates.shitcoiner) {
    // TODO maybe consider iterating through worldObects
    let shitcoiner = new Shitcoiner(
      'shitcoiner-' + Math.random(),
      {
        x: CTDLGAME.viewport.x + Math.round(Math.random() * constants.WIDTH),
        y: CTDLGAME.world.h - constants.GROUNDHEIGHT - constants.MENU.h - 30,
        status: 'spawn'
      }
    )

    // spawn low and test down until void is found
    let spawned = false
    do {
      let hasCollided = CTDLGAME.quadTree.query(shitcoiner.getBoundingBox())
        .filter(point => point.isSolid && point.id !== shitcoiner.id)
        .some(point => intersects(shitcoiner.getBoundingBox(), point.getBoundingBox()))

      if (!hasCollided) {
        spawned = true
        CTDLGAME.objects.push(shitcoiner)
      } else {
        shitcoiner.y -= 1
      }
    } while (!spawned && shitcoiner.y > 0)
  }
  if (Math.random() < CTDLGAME.world.map.spawnRates.rabbit) {
    let rabbit = new Rabbit(
      'rabbit-' + Math.random(),
      {
        x: CTDLGAME.viewport.x + Math.round(Math.random() * constants.WIDTH),
        y: CTDLGAME.viewport.y + constants.HEIGHT - constants.MENU.h,
        status: 'spawn'
      }
    )

    // spawn low and test down until void is found
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
  if (Math.random() < CTDLGAME.world.map.spawnRates.goldbugs) {
    let goldbugs = new Goldbugs(
      'goldbugs-' + Math.random(),
      {
        x: CTDLGAME.viewport.x + Math.round(Math.random() * constants.WIDTH),
        y: CTDLGAME.viewport.y + constants.HEIGHT - constants.MENU.h,
        status: 'idle'
      }
    )

    // spawn low and test down until void is found
    let spawned = false
    do {
      let hasCollided = CTDLGAME.quadTree.query(goldbugs.getBoundingBox())
        .filter(point => point.isSolid && point.id !== goldbugs.id)
        .some(point => intersects(goldbugs.getBoundingBox(), point.getBoundingBox()))

      if (!hasCollided) {
        spawned = true
        CTDLGAME.objects.push(goldbugs)
      } else {
        goldbugs.y -= 1
      }
    } while (!spawned && goldbugs.y > 0)
  }
}