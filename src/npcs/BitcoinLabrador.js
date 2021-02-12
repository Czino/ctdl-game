import { BehaviorTree, Selector, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

import spriteData from '../sprites/bitcoinLabrador'
import { CTDLGAME } from '../gameUtils'
import { moveObject, intersects, getClosest } from '../geometryUtils'
import constants from '../constants'
import { addTextToQueue } from '../textUtils';
import { playSound } from '../sounds';
import Agent from '../Agent'

const exhausted = new Task({
  run: agent => {
    if (agent.exhaustion > 10) agent.exhausted = true
    if (!agent.exhausted) return FAILURE
    agent.status = 'exhausted'
    agent.exhaustion--
    if (agent.exhaustion === 0) agent.exhausted = false
    return SUCCESS
  }
})
const moveToFriend = new Task({
  run: agent => {
    if (!agent.closestFriend || agent.goal || Math.random() < .90) return FAILURE
    if (Math.abs(agent.closestFriend.getCenter().x - agent.getCenter().x) < 10) return FAILURE
    agent.status = Math.random() < .5 ? 'move' : 'run'
    agent.goal = agent.closestFriend.x
    return SUCCESS
  }
})
const moveToPointX = new Task({
  run: agent => {
    if (!agent.goal && Math.random() < .008) {
      agent.goal = Math.round(Math.random() * CTDLGAME.world.w)
      agent.status = 'move'
    }
    if (Math.abs(agent.x - agent.goal) < 15) agent.goal = null
    if (!agent.goal || agent.status !== 'move') return FAILURE

    if (agent.x < agent.goal) return agent.moveRight.condition() ? agent.moveRight.effect() : FAILURE
    if (agent.x > agent.goal) return agent.moveLeft.condition() ? agent.moveLeft.effect() : FAILURE
    return agent.moveRandom.condition() ? agent.moveRandom.effect() : FAILURE
  }
})

const runToPointX = new Task({
  run: agent => {
    if (!agent.goal && Math.random() < .002) {
      agent.goal = Math.round(Math.random() * CTDLGAME.world.w)
      agent.status = 'run'
    }
    if (Math.abs(agent.x - agent.goal) < 20) agent.goal = null
    if (!agent.goal || agent.status !== 'run') return FAILURE
    if (agent.x < agent.goal) return agent.runRight.condition() ? agent.runRight.effect() : FAILURE
    if (agent.x > agent.goal) return agent.runLeft.condition() ? agent.runLeft.effect() : FAILURE
  }
})

// Selector: runs until one node calls success
const regularBehaviour = new Selector({
  nodes: [
    moveToFriend,
    moveToPointX,
    runToPointX,
    'idle'
  ]
})


const tree = new Selector({
  nodes: [
    'survive',
    exhausted,
    regularBehaviour
  ]
})

class BitcoinLabrador extends Agent {
  constructor(id, options) {
    super(id, options)
    this.spriteId = 'bitcoinLabrador'
    this.spriteData = spriteData
    this.maxHealth = options.maxHealth ?? Math.round(Math.random() * 5) + 5
    this.health = options.health ?? this.maxHealth
    this.strength = 1
    this.exhaustion = options.exhaustion || 0
    this.exhausted = options.exhausted
    this.status = options.status || 'idle'
    this.attackRange = options.attackRange ?? Math.ceil(Math.random() * 70) + 70
    this.senseRadius = this.attackRange
    this.walkingSpeed = options.walkingSpeed || 2
    this.runningSpeed = options.runningSpeed || 6
    this.protection = 0

    this.goal = options.goal
    if (!this.goal && Math.random() < .5 && CTDLGAME.world) this.goal = Math.round(Math.random() * CTDLGAME.world.w)
  }

  says = []
  w = 25
  h = 14
  applyGravity = true

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  idle = {
    condition: () => true,
    effect: () => {
      this.status = 'idle'
      this.exhaustion -= .5
      return SUCCESS
    }
  }
  runLeft = {
    condition: () => true,
    effect: () => {
      this.direction = 'left'
      this.isMoving = 'left'
      const hasMoved =  !moveObject(this, { x: -this.runningSpeed, y: 0 }, CTDLGAME.quadTree)

      if (hasMoved) {
        this.status = 'run'
        this.exhaustion++

        return SUCCESS
      }

      return FAILURE
    }
  }
  runRight = {
    condition: () => true,
    effect: () => {
      this.direction = 'right'
      this.isMoving = 'right'

      const hasMoved = !moveObject(this, { x: this.runningSpeed , y: 0}, CTDLGAME.quadTree)
      if (hasMoved) {
        this.status = 'run'
        this.exhaustion++
        return SUCCESS
      }

      return FAILURE
    }
  }

  hurt = (dmg, direction) => {
    if (/hurt|rekt/.test(this.status) || this.protection > 0) return
    const lostFullPoint = Math.floor(this.health) - Math.floor(this.health - dmg) > 0
    this.health = Math.max(this.health - dmg, 0)

    if (!lostFullPoint) return

    this.dmgs.push({y: -8, dmg: Math.ceil(dmg)})
    this.status = 'hurt'
    this.vx = direction === 'left' ? 5 : -5
    this.vy = -3
    this.protection = 8
    playSound('rabbitHurt')
    if (this.health <= 0) {
      this.health = 0
      this.die()
    }
  }

  die = () => {
    this.status = 'rekt'
    this.health = 0
    this.removeTimer = 64

    addTextToQueue(`Bitcoin Labrador got rekt`)
  }

  update = () => {
    if (CTDLGAME.lockCharacters) {

      this.draw()
      return
    }

    this.applyPhysics()
    if (this.status === 'fall') this.status = 'run'

    if (this.status === 'hurt' && this.vx === 0 && this.vy === 0) {
      this.status = 'idle'
    }

    this.exhaustion = Math.max(0, this.exhaustion)

    const senseBox = this.getSenseBox()
    this.sensedObjects = CTDLGAME.quadTree.query(senseBox)

    this.touchedObjects = CTDLGAME.quadTree
      .query(this.getBoundingBox())
      .filter(obj => intersects(this.getBoundingBox(), obj.getBoundingBox()))


    if (window.DRAWSENSORS) {
      constants.charContext.beginPath()
      constants.charContext.rect(senseBox.x, senseBox.y, senseBox.w, senseBox.h)
      constants.charContext.stroke()
    }

    this.sensedEnemies = this.sensedObjects
      .filter(enemy => enemy.enemy && enemy.health && enemy.health > 0)
      .filter(enemy => Math.abs(enemy.getCenter().x - this.getCenter().x) <= this.senseRadius)

    this.sensedFriends = this.sensedObjects
      .filter(friend => /Character/.test(friend.getClass()) && friend.id !== this.id && friend.status !== 'rekt')
      .filter(friend => Math.abs(friend.getCenter().x - this.getCenter().x) <= this.senseRadius)

    if (Math.abs(this.vy) < 3 && !/fall|rekt|hurt/.test(this.status)) {
      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.closestFriend = getClosest(this, this.sensedFriends)
      this.bTree.step()
    }

    if (this.status !== 'idle' || Math.random() < .05) {
      this.frame++
    }

    if (this.frame >= this.spriteData[this.direction][this.status].length) {
      this.frame = 0
      if (/action/.test(this.status)) this.status = 'idle'
    }

    if (this.removeTimer) this.removeTimer--
    if (this.removeTimer === 0) this.remove = true

    this.draw()
  }

  say = say => {
    this.says = [{y: -8, say}]
  }
}
export default BitcoinLabrador