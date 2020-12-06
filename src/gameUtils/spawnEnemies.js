import constants from '../constants'
import Shitcoiner from '../enemies/Shitcoiner'
import Rabbit from '../enemies/Rabbit'
import Goldbugs from '../enemies/Goldbugs'
import { CTDLGAME } from './CTDLGAME'
import { intersects } from '../geometryUtils'


/**
 * @description Method to spawn agent
 * @param {Agent} agent the agent to spawn
 */
export const spawnAgent = agent => {
  // check vertical if solid tiles can be found
  // TODO improve code to work in tunnels
  let vertical = {
    x: agent.getBoundingBox(),
    y: CTDLGAME.viewport.y,
    w: agent.getBoundingBox().w,
    h: constants.HEIGHT
  }
  let highestSolid = CTDLGAME.quadTree.query(vertical)
      .filter(point => point.isSolid)
      .sort((a, b) => a.y > b.y ? 1 : -1)
      .find(() => true)

  if (highestSolid) {
    agent.y = highestSolid.y - agent.getBoundingBox().h
  }
  let hasCollided = CTDLGAME.quadTree.query(agent.getBoundingBox())
    .filter(point => point.isSolid && point.id !== agent.id)
    .some(point => intersects(agent.getBoundingBox(), point.getBoundingBox()))

  if (!hasCollided) {
    CTDLGAME.objects.push(agent)
  }
}
/**
 * @description Method that takes care of spawning enemies according to spawn rate and world
 * @returns {void}
 */
export const spawnEnemies = () => {
  if (CTDLGAME.isNight && Math.random() < CTDLGAME.world.map.spawnRates.shitcoiner) {
    // TODO maybe consider iterating through worldObects
    spawnAgent(new Shitcoiner(
      'shitcoiner-' + Math.random(),
      {
        x: CTDLGAME.viewport.x + Math.round(Math.random() * constants.WIDTH),
        y: CTDLGAME.viewport.y + constants.HEIGHT - 1,
        status: 'spawn'
      }
    ))
  }
  if (Math.random() < CTDLGAME.world.map.spawnRates.rabbit) {
    spawnAgent(new Rabbit(
      'rabbit-' + Math.random(),
      {
        x: CTDLGAME.viewport.x + Math.round(Math.random() * constants.WIDTH),
        y: CTDLGAME.viewport.y + constants.HEIGHT,
        status: 'spawn'
      }
    ))
  }
  if (Math.random() < CTDLGAME.world.map.spawnRates.goldbugs) {
    spawnAgent(new Goldbugs(
      'goldbugs-' + Math.random(),
      {
        x: CTDLGAME.viewport.x + Math.round(Math.random() * constants.WIDTH),
        y: CTDLGAME.viewport.y + constants.HEIGHT,
        status: 'idle'
      }
    ))
  }
}