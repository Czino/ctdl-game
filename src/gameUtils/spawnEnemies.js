import constants from '../constants'
import Shitcoiner from '../enemies/Shitcoiner'
import Rabbit from '../enemies/Rabbit'
import Goldbugs from '../enemies/Goldbugs'
import { CTDLGAME } from './CTDLGAME'
import { collidesWithHeightMap, intersects } from '../geometryUtils'
import Citizen from '../npcs/Citizen'
import { random } from '../arrayUtils'


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
    .filter(point => point.isSolid && point.id !== agent.id)
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
export const spawnEnemies = () => {
  if (CTDLGAME.isNight && Math.random() < CTDLGAME.world.map.spawnRates.shitcoiner) {
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
  if (Math.random() < CTDLGAME.world.map.spawnRates.citizen) {
    let doors = CTDLGAME.quadTree.query(CTDLGAME.viewport).filter(obj => /door/.test(obj.id))
    let door = random(doors)
    spawnAgent(new Citizen(
      'citizen-' + Math.random(),
      {
        x: door && Math.random() < .2
          ? door.x + Math.round(door.w / 2)
          : Math.random() < .5
          ? CTDLGAME.viewport.x - 16
          : CTDLGAME.viewport.x + constants.WIDTH,
        y: CTDLGAME.viewport.y + constants.HEIGHT,
        status: 'idle'
      }
    ))
  }
}