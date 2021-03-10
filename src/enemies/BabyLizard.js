import { BehaviorTree, Selector, Sequence } from '../../node_modules/behaviortree/dist/index.node'

import babyLizard from '../sprites/babyLizard'
import { CTDLGAME } from '../gameUtils'
import { getClosest } from '../geometryUtils'
import constants from '../constants'
import { playSound } from '../sounds';
import Agent from '../Agent'
import { addTextToQueue } from '../textUtils'


// Sequence: runs each node until fail
const attackEnemy = new Sequence({
  nodes: [
    'touchesEnemy',
    'attack'
  ]
})

// Selector: runs until one node calls success
const goToEnemy = new Selector({
  nodes: [
    'touchesEnemy',
    'moveToClosestEnemy'
  ]
})
const tree = new Selector({
  nodes: [
    attackEnemy,
    goToEnemy,
    'moveToPointX',
    'idle'
  ]
})



const items = [
  { id: 'steak', chance: 0.01 }
]

class BabyLizard extends Agent {
  constructor(id, options) {
    super(id, options)
    this.spriteData = babyLizard
    this.maxHealth = options.maxHealth || 8 + Math.round(Math.random() * 4)
    this.health = options.health ?? Math.round(this.maxHealth / 2)
    this.item = options.item || items.find(item => item.chance >= Math.random())
    this.strength = 2
    this.attackRange = 3
    this.senseRadius = 50
    this.protection = 0
    this.walkingSpeed = 2
    this.hatchCountdown = options.hatchCountdown || 44 + Math.round(Math.random() * 26)
    this.hatched = options.hatched
    this.canMove = options.hatched
  }

  enemy = true
  boss = true
  w = 16
  h = 30

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  onHurt = () => {
    if (this.status === 'egg') return

    this.protection = 8
    playSound('rabbitHurt')
  }

  onDie = () => {
    addTextToQueue(`Baby Lizard got rekt`)
    if (this.status === 'egg') this.remove = true
    this.removeTimer = 64
  }

  update = () => {
    if (!this.sprite) this.sprite = CTDLGAME.assets.babyLizard

    if (CTDLGAME.lockCharacters) {
      this.draw()
      return
    }

    this.applyPhysics()
    if (this.status === 'fall' && this.vy === 0) this.status = 'idle'

    if (this.status === 'hurt' && this.vx === 0 && this.vy === 0) {
      this.status = 'idle'
    }

    const senseBox = this.getSenseBox()
    this.sensedObjects = CTDLGAME.quadTree.query(senseBox)

    if (window.DRAWSENSORS) {
      constants.charContext.beginPath()
      constants.charContext.rect(senseBox.x, senseBox.y, senseBox.w, senseBox.h)
      constants.charContext.stroke()
    }

    this.sensedEnemies = this.sensedObjects
      .filter(enemy => enemy.getClass() === 'Character' && enemy.health > 0)
      .filter(enemy => Math.abs(enemy.getCenter().x - this.getCenter().x) <= this.senseRadius)

    this.sensedFriends = []

    if (this.status !== 'rekt' && this.hatchCountdown > 0) {
      this.status = 'egg'
      this.hatchCountdown--
      if (this.hatchCountdown === 0) {
        this.status = 'hatch'
      }
    }
    if (this.status === 'hatch' && this.frame === 6) {
      this.status = 'idle'
      this.hatched = true
      this.canMove = true
      this.health = this.maxHealth
    }

    if (Math.abs(this.vy) < 3 && this.canMove && !/egg|hatch|fall|rekt|hurt/.test(this.status)) {
      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.closestFriend = getClosest(this, this.sensedFriends)
      this.bTree.step()
    }

    this.frame++

    if (this.removeTimer) this.removeTimer--
    if (this.removeTimer === 0) this.remove = true

    this.draw()
  }

  getBoundingBox = () => ({ // normal
      id: this.id,
      x: this.x + 6,
      y: this.y + 20,
      w: this.w - 12,
      h: this.h - 20
    })
}
export default BabyLizard