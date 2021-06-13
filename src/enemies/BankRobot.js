import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

import bankRobot from '../sprites/bankRobot'
import { CTDLGAME } from '../gameUtils'
import { getClosest } from '../geometryUtils'
import constants from '../constants'
import { playSound } from '../sounds'
import Agent from '../Agent'
import { addTextToQueue } from '../textUtils'
import { senseCharacters } from './enemyUtils'
import PoliceForce from './PoliceForce'


const patrol = new Task({
  run: agent => {
    if (agent.coolDown === 0) {
      agent.direction = agent.direction === 'left' ? 'right' : 'left'
      agent.coolDown = null
    }
    let action = agent.direction === 'left' ? 'moveLeft' : 'moveRight'

    if (agent.coolDown) {
      agent.coolDown--
      return FAILURE
    }

    let hasMoved = agent[action].effect() === SUCCESS
    if (!hasMoved) {
      agent.coolDown = 21
      return FAILURE
    }

    return hasMoved
  }
})

const informSecurity = new Task({
  run: agent => {
    if (agent.alarmCoolDown) {
      return SUCCESS
    }
    if (!CTDLGAME.world.map.state.bankingHoursOver) return FAILURE
    if (agent.sensedEnemies.length === 0) return FAILURE

    agent.status = 'alarm'
    agent.alarmCoolDown = 128
    playSound('alarm')

    for (let i = 4; i > 0; i--) {
      CTDLGAME.objects.push(new PoliceForce(`policeForce-${Math.random()}`, {
        x: window.SELECTEDCHARACTER.x > 18 * 8 ? CTDLGAME.viewport.x -  40 + i * 4 : CTDLGAME.viewport.x + constants.WIDTH + i * 4,
        y: window.SELECTEDCHARACTER.y,
        enemy: true,
        sensedCriminals: ['hodlonaut', 'katoshi']
      }))
    }
    return SUCCESS
  }
})
const informCustomer = new Task({
  run: agent => {
    if (CTDLGAME.world.map.state.bankingHoursOver) return FAILURE
    if (agent.talks) return FAILURE

    if (CTDLGAME.world.map.state.bankingHoursAlert) {
      let seconds = Math.round(CTDLGAME.world.map.state.secondsUntilClose / 10) * 10
      agent.talks = true
      addTextToQueue(`Security Robot:\nAttention! Banking hours are over, lockup begins in\n${seconds} seconds.`)
      addTextToQueue('Security Robot:\nAll personell must leave the blue coded areas\nimmediately. Thank you.', () => agent.talks = false)
    } else if (!CTDLGAME.world.map.state.bankingHoursAlert && agent.sensedEnemies.length > 0) {
      agent.talks = true
      addTextToQueue('Security Robot:\nWelcome to Ripam Centralis, how may I help you?', () => agent.talks = false)
    }

    return FAILURE
  }
})



const tree = new Selector({
  nodes: [
    informSecurity,
    informCustomer,
    patrol,
    'idle'
  ]
})

class BankRobot extends Agent {
  constructor(id, options) {
    super(id, options)
    this.spriteData = bankRobot
    this.spriteId = 'bankRobot'
    this.health = options.health ?? 10
    this.maxHealth = 10
    this.senseRadius = 64
    this.walkingSpeed = 1
    this.makeSound = 16
    this.alarmCoolDown = null
  }

  w = 16
  h = 8

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  onHurt = () => playSound('clunk')
  hurtCondition = () => !this.protection
  onDie = () => playSound('robotRekt')

  update = () => {
    if (CTDLGAME.lockCharacters) {
      this.draw()
      return
    }

    this.enemy = CTDLGAME.world.map.state.bankingHoursOver

    this.applyPhysics()
    if (this.status === 'fall') this.status = 'idle'


    if (Math.abs(this.vy) < 3 && this.status !== 'rekt') {
      this.sensedEnemies = senseCharacters(this)
      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.makeSound--
      if (this.makeSound < 0 && this.alarmCoolDown === 0) {
        this.makeSound = 16
        if (this.closestEnemy) {
          let vol = 1 - (Math.abs(this.closestEnemy.getCenter().x - this.getCenter().x) / this.senseRadius)
          playSound('sonar', vol)
        }
      }
      this.sensedEnemies = this.sensedEnemies.filter(enemy => {
        if (this.direction === 'left') {
          return enemy.getCenter().x < this.getCenter().x
        }
        return enemy.getCenter().x > this.getCenter().x
      })
      this.bTree.step()
    }

    this.frame++

    this.draw()

    if (this.alarmCoolDown > 0 && this.status !== 'rekt') {
      this.alarmCoolDown--
      constants[this.context].fillStyle = this.alarmCoolDown % 2 ? '#1462e9': '#e91414'
      constants[this.context].fillRect(this.x + 2, this.y + 5, 1, 1)
      constants[this.context].fillRect(this.x + 1, this.y + 6, 1, 1)
      if (this.alarmCoolDown === 0) this.alarmCoolDown = null
      return SUCCESS
    }
  }
}
export default BankRobot