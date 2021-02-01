import { BehaviorTree, Selector, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

import hodlTarantulaSprite from '../sprites/hodlTarantula'
import { CTDLGAME } from '../gameUtils'
import { intersects, getClosest } from '../geometryUtils'
import constants from '../constants'
import Agent from '../Agent'
import { random } from '../arrayUtils'
import { addTextToQueue } from '../textUtils'


const moveToPointX = new Task({
  run: agent => {
    if (!agent.goal && Math.random() < .05 * agent.business) agent.goal = Math.round(Math.random() * 82) + 632
    if (agent.x % agent.goal < 5) agent.goal = null
    if (!agent.goal) return FAILURE
    if (agent.x < agent.goal) return agent.moveRight.condition() ? agent.moveRight.effect() : FAILURE
    if (agent.x > agent.goal) return agent.moveLeft.condition() ? agent.moveLeft.effect() : FAILURE
    return agent.moveRandom.condition() ? agent.moveRandom.effect() : FAILURE
  }
})
const hang = new Task({
  run: agent => {
    if (agent.status === 'hang') {
      return SUCCESS
    } else if (agent.x > 648 || agent.goal || Math.random() < .2 * agent.business) {
      return FAILURE
    }
    agent.status = 'hang'
    return SUCCESS
  }
})

// Selector: runs until one node calls success
const regularBehaviour = new Selector({
  nodes: [
    moveToPointX,
    hang,
    'idle'
  ]
})


const tree = new Selector({
  nodes: [
    'survive',
    regularBehaviour
  ]
})

class HodlTarantula extends Agent {
  constructor(id, options) {
    super(id, options)
    this.spriteId = 'hodlTarantula'
    this.spriteData = hodlTarantulaSprite
    this.maxHealth = options.maxHealth ?? Math.round(Math.random() * 5) + 5
    this.health = options.health ?? this.maxHealth
    this.strength = 1
    this.status = options.status || 'idle'
    this.attackRange = options.attackRange ?? Math.ceil(Math.random() * 70) + 70
    this.senseRadius = this.attackRange
    this.walkingSpeed = options.walkingSpeed || 2
    this.protection = 0
    this.business = 1
    this.thingsToSay = [
      ['hodl_tarantula:\nBuild and Hodl my wayward\nson there\'ll be peace when\nyou are done.']
    ]
    this.goal = options.goal
    if (!this.goal && Math.random() < .5 && CTDLGAME.world) this.goal = Math.round(Math.random() * CTDLGAME.world.w)
  }

  says = []
  w = 39
  h = 34
  applyGravity = true

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  update = () => {
    if (CTDLGAME.lockCharacters) {
      this.draw()
      return
    }

    this.applyPhysics()
    if (this.status === 'fall') this.status = 'hang'

    if (this.status === 'hurt' && this.vx === 0 && this.vy === 0) {
      this.status = 'idle'
    }

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
      .filter(enemy => enemy.enemey && enemy.health && enemy.health > 0)
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

    this.draw()
  }

  select = () => {
    if (!this.thingsToSay || this.isSelected) return
    this.isSelected = true

    let whatToSay = random(this.thingsToSay)
      whatToSay.map((text, index) => {
        if (index === whatToSay.length - 1) {
          addTextToQueue(text, () => {
            this.isSelected = false
          })
        } else {
          addTextToQueue(text)
        }
      })
  }

  getBoundingBox = () => ({
    id: this.id,
    x: this.x,
    y: this.y + 21,
    w: this.w,
    h: this.h - 21
  })
}
export default HodlTarantula