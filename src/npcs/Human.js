import { BehaviorTree, Selector, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

import citizenSpriteData from '../sprites/citizen'
import { CTDLGAME } from '../gameUtils'
import { moveObject, intersects, getClosest } from '../geometryUtils'
import { write } from '../font';
import constants from '../constants'
import { addTextToQueue } from '../textUtils';
import { playSound } from '../sounds';
import Agent from '../Agent'
import { random } from '../arrayUtils';


// Selector: runs until one node calls success
const regularBehaviour = new Selector({
  nodes: [
    'moveToPointX',
    'idle'
  ]
})

const tree = new Selector({
  nodes: [
    'survive',
    regularBehaviour
  ]
})

class Human extends Agent {
  constructor(id, options) {
    super(id, options)
    this.spriteId = options.spriteId || 'citizen1'
    this.spriteData = citizenSpriteData
    this.maxHealth = options.maxHealth ?? Math.round(Math.random() * 5) + 5
    this.health = options.health ?? this.maxHealth
    this.strength = 1
    this.context = options.context || (Math.random() < .5 ? 'bgContext' : 'charContext')
    this.attackRange = options.attackRange ?? Math.ceil(Math.random() * 70) + 70
    this.senseRadius = this.attackRange
    this.applyGravity = options.applyGravity ?? true
    this.walkingSpeed = options.walkingSpeed || 3
    this.runningSpeed = options.runningSpeed || Math.round(Math.random() * 2) + 4
    this.protection = 0
    this.thingsToSay = options.thingsToSay

    this.delay = Math.round(Math.random() * 2) * constants.FRAMERATE
    this.speed = Math.round(Math.random() * 3) * constants.FRAMERATE
    this.goal = options.goal
    if (!this.goal && Math.random() < .5 && CTDLGAME.world) this.goal = Math.round(Math.random() * CTDLGAME.world.w)
  }

  w = 16
  h = 30


  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  runLeft = {
    condition: () => true,
    effect: () => {
      this.direction = 'left'
      this.isMoving = 'left'
      const hasMoved =  !moveObject(this, { x: -this.runningSpeed, y: 0 }, CTDLGAME.quadTree)

      if (hasMoved) {
        this.status = 'run'
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
        return SUCCESS
      }

      return FAILURE
    }
  }

  // TODO compare to Agent and Character class
  hurt = (dmg, direction) => {
    if (!this.hurtCondition(dmg, direction)) return
    const lostFullPoint = Math.floor(this.health) - Math.floor(this.health - dmg) > 0
    this.health = Math.max(this.health - dmg, 0)

    if (!lostFullPoint) return

    this.dmgs.push({
      x: Math.round((Math.random() - .5) * 8),
      y: -8,
      dmg: Math.ceil(dmg)
    })
    this.status = 'hurt'
    this.vx = direction === 'left' ? 5 : -5
    this.vy = -3
    this.protection = 8
    playSound('playerHurt')
    if (this.health / this.maxHealth <= .2) this.say('help!')
    if (this.health <= 0) {
      this.health = 0
      return this.die()
    }
    return this.onHurt()
  }

  die = () => {
    this.status = 'rekt'
    this.health = 0
  }

  onDie = () => {
    this.removeTimer = 64
    addTextToQueue(`Human got rekt`)
  }

  update = () => {
    if (CTDLGAME.lockCharacters) {
      this.draw()
      return
    }

    this.applyPhysics()
    if (this.status === 'fall') this.status = 'hurt'

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
      .filter(enemy => enemy.enemy && enemy.health && enemy.health > 0)
      .filter(enemy => Math.abs(enemy.getCenter().x - this.getCenter().x) <= this.senseRadius)

    this.sensedFriends = this.sensedObjects
      .filter(friend => /Character|Human/.test(friend.getClass()) && friend.id !== this.id && friend.status !== 'rekt')
      .filter(friend => Math.abs(friend.getCenter().x - this.getCenter().x) <= this.senseRadius)

    if (Math.abs(this.vy) < 3 && !/fall|rekt|hurt/.test(this.status)) {
      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.closestFriend = getClosest(this, this.sensedFriends)
      this.bTree.step()
    }

    if (/attack/i.test(this.status)) {
      if ((CTDLGAME.frame + this.delay) % this.speed === 0) {
        this.frame++
      }
    } else if (this.status !== 'idle' || Math.random() < .05) {
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

  getBoundingBox = () =>this.status !== 'rekt'
    ? ({ // normal
        id: this.id,
        x: this.x + 6,
        y: this.y + 6,
        w: this.w - 12,
        h: this.h - 6
      })
    : ({ // rekt
      id: this.id,
      x: this.x + 5,
      y: this.y + 3,
      w: this.w - 10,
      h: this.h - 3
    })

  getAnchor = () => this.status !== 'rekt'
    ? ({
        x: this.getBoundingBox().x + 2,
        y: this.getBoundingBox().y + this.getBoundingBox().h - 1,
        w: this.getBoundingBox().w - 4,
        h: 1
    })
    : ({
      x: this.getBoundingBox().x,
      y: this.getBoundingBox().y + this.getBoundingBox().h - 1,
      w: this.getBoundingBox().w,
      h: 1
  })
}
export default Human