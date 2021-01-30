import { BehaviorTree, Selector } from '../../node_modules/behaviortree/dist/index.node'

import spriteData from '../sprites/citizen'
import { CTDLGAME } from '../gameUtils'
import { intersects, getClosest } from '../geometryUtils'
import { write } from '../font';
import constants from '../constants'
import { addTextToQueue } from '../textUtils';
import Human from './Human'

// Selector: runs until one node calls success
const regularBehaviour = new Selector({
  nodes: [
    // 'moveToPointX',
    'idle'
  ]
})

// only "protest while condition is met otherwise just walk around
const tree = new Selector({
  nodes: [
    'survive',
    regularBehaviour
  ]
})

class Luma extends Human {
  constructor(id, options) {
    super(id, options)
    this.spriteData = spriteData
    this.maxHealth = options.maxHealth ?? Math.round(Math.random() * 5) + 5
    this.health = options.health ?? this.maxHealth
    this.strength = 1
    this.attackRange = options.attackRange ?? Math.ceil(Math.random() * 70) + 70
    this.senseRadius = this.attackRange
    this.applyGravity = options.applyGravity ?? true
    this.walkingSpeed = options.walkingSpeed || 3
    this.runningSpeed = options.runningSpeed || Math.round(Math.random() * 2) + 4
    this.protection = 0

    this.goal = options.goal
    if (!this.goal && Math.random() < .5 && CTDLGAME.world) this.goal = Math.round(Math.random() * CTDLGAME.world.w)
  }

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })


  onDie = () => {
    addTextToQueue(`Luma got rekt`)
  }

  update = () => {
    if (!this.sprite) this.sprite = CTDLGAME.assets.luma

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
      .filter(enemy => enemy.enemey && enemy.health && enemy.health > 0)
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

    this.draw()

    if (this.selected) {
      constants.charContext.fillStyle = '#0F0'
      constants.charContext.fillRect(
        this.x + this.w / 2, this.y - 2, 1, 1
      )
    }
  }
}
export default Luma