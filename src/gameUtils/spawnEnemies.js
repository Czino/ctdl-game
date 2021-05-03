import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'
import { collidesWithHeightMap, intersects } from '../geometryUtils'

/**
 * @description Method to spawn agent
 * @param {Agent} agent the agent to spawn
 */
export const spawnAgent = agent => {
  // check vertical if solid tiles can be found
  let vertical = {
    x: agent.getBoundingBox().x,
    y: CTDLGAME.viewport.y,
    w: agent.getBoundingBox().w,
    h: constants.HEIGHT
  }
  let highestSpawnPoint = CTDLGAME.quadTree.query(vertical)
      .filter(point => point.spawnPoint)
      .sort((a, b) => a.y > b.y ? 1 : -1)
      .find(() => true)

  if (highestSpawnPoint) {
    agent.y = highestSpawnPoint.getTrueY
      ? highestSpawnPoint.getTrueY() - agent.getBoundingBox().h - 1
      : highestSpawnPoint.y - agent.getBoundingBox().h - 1
    agent.y -= agent.getBoundingBox().y - agent.y // normalize for boundingbox
  }

  if (!highestSpawnPoint) return

  let hasCollided = CTDLGAME.quadTree.query(agent.getBoundingBox())
    .filter(point => point.isSolid).concat(
      CTDLGAME.quadTree.query(agent.getBoundingBox())
      .filter(point => point.getClass() === agent.getClass())
    )
    .filter(point => intersects(agent.getBoundingBox(), point.getBoundingBox()))
    .some(point => {
      if (!point.getHeightMap) return true

      const anchor = agent.getAnchor()
      return collidesWithHeightMap(anchor, point)
    })

  if (!hasCollided) {
    agent.y += 1 // let them spawn a little inside the floor
    CTDLGAME.objects.push(agent)
  }
}

/**
 * @description Method that takes care of spawning enemies according to spawn rate and world
 * @returns {void}
 */
export const spawnEnemies = () => {}