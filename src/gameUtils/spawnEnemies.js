import constants from '../constants'
import Shitcoiner from '../enemies/Shitcoiner'
import Rabbit from '../enemies/Rabbit'
import Goldbugs from '../enemies/Goldbugs'
import { CTDLGAME } from './CTDLGAME'
import { collidesWithHeightMap, intersects } from '../geometryUtils'
import Citizen from '../npcs/Citizen'
import { random } from '../arrayUtils'
import Car from '../objects/Car'
import Bull from '../objects/Bull'
import PoliceForce from '../enemies/PoliceForce'
import Bagholder from '../enemies/Bagholder'
import Cobra from '../enemies/Cobra'
import Blockchain from '../enemies/Blockchain'


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
export const spawnEnemies = () => {
  if (CTDLGAME.isNight && Math.random() < CTDLGAME.world.map.spawnRates.shitcoiner) {
    return spawnAgent(new Shitcoiner(
      'shitcoiner-' + Math.random(),
      {
        x: CTDLGAME.viewport.x + Math.round(Math.random() * constants.WIDTH),
        y: CTDLGAME.viewport.y + constants.HEIGHT - 1,
        status: 'spawn'
      }
    ))
  }
  if (Math.random() < CTDLGAME.world.map.spawnRates.rabbit) {
    return spawnAgent(new Rabbit(
      'rabbit-' + Math.random(),
      {
        x: CTDLGAME.viewport.x + Math.round(Math.random() * constants.WIDTH),
        y: CTDLGAME.viewport.y + constants.HEIGHT,
        status: 'spawn'
      }
    ))
  }
  if (Math.random() < CTDLGAME.world.map.spawnRates.goldbugs) {
    return spawnAgent(new Goldbugs(
      'goldbugs-' + Math.random(),
      {
        x: CTDLGAME.viewport.x + Math.round(Math.random() * constants.WIDTH),
        y: CTDLGAME.viewport.y + constants.HEIGHT,
        status: 'idle'
      }
    ))
  }
  if (Math.random() < CTDLGAME.world.map.spawnRates.cobra) {
    return spawnAgent(new Cobra(
      'cobra-' + Math.random(),
      {
        x: Math.random() < .5
          ? CTDLGAME.viewport.x - 16
          : CTDLGAME.viewport.x + constants.WIDTH,
        y: CTDLGAME.viewport.y + constants.HEIGHT,
        status: 'idle'
      }
    ))
  }
  if (Math.random() < CTDLGAME.world.map.spawnRates.bagholder) {
    return spawnAgent(new Bagholder(
      'bagholder-' + Math.random(),
      {
        x: Math.random() < .5
          ? CTDLGAME.viewport.x - 16
          : CTDLGAME.viewport.x + constants.WIDTH,
        y: CTDLGAME.viewport.y + constants.HEIGHT,
        status: 'idle'
      }
    ))
  }
  if (Math.random() < CTDLGAME.world.map.spawnRates.citizen) {
    let doors = CTDLGAME.quadTree.query(CTDLGAME.viewport).filter(obj => /door/.test(obj.id))
    let door = random(doors)
    return spawnAgent(new Citizen(
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
  if (Math.random() < CTDLGAME.world.map.spawnRates.policeForce && !CTDLGAME.world.map.state.protestScene) {
    let doors = CTDLGAME.quadTree.query(CTDLGAME.viewport).filter(obj => /door/.test(obj.id))
    let door = random(doors)
    return spawnAgent(new PoliceForce(
      'policeForce-' + Math.random(),
      {
        x: door && Math.random() < .2
          ? door.x + Math.round(door.w / 2)
          : Math.random() < .5
          ? CTDLGAME.viewport.x - 16
          : CTDLGAME.viewport.x + constants.WIDTH,
        y: CTDLGAME.viewport.y + constants.HEIGHT,
        status: 'idle',
        hasShield: false,
        flashbangs: 0
      }
    ))
  }
  if (Math.random() < CTDLGAME.world.map.spawnRates.blockchain) {
    return spawnAgent(new Blockchain(
      'blockchain-' + Math.random(),
      {
        x: CTDLGAME.viewport.x + Math.round(Math.random() * constants.WIDTH),
        y: CTDLGAME.viewport.y + constants.HEIGHT - 1
      }
    ))
  }
  if (Math.random() < CTDLGAME.world.map.spawnRates.car && !CTDLGAME.world.map.state.protestScene) {
    return spawnAgent(new Car(
      'car-' + Math.random(),
      {
        x: Math.random() < .5 ? CTDLGAME.viewport.x - 75 : CTDLGAME.viewport.x + constants.WIDTH,
        y: CTDLGAME.viewport.y + constants.HEIGHT,
        offsetY: 6,
        vx: Math.round((Math.random() - .5) * 5) * 4
      }
    ))
  }
  if (Math.random() < CTDLGAME.world.map.spawnRates.bull) {
    return spawnAgent(new Bull(
      'bull-' + Math.random(),
      {
        x: CTDLGAME.viewport.x - 47,
        y: CTDLGAME.viewport.y + constants.HEIGHT,
        vx: Math.round((Math.random()) * 3) + 10,
        context: Math.random() < .5 ? 'bgContext' : 'fgContext'
      }
    ))
  }
}