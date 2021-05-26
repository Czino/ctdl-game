import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

import goldbugSprite from '../sprites/goldbugs'
import { CTDLGAME } from '../gameUtils'
import { intersects, getClosest } from '../geometryUtils'
import { playSound } from '../sounds'
import { senseCharacters } from './enemyUtils'
import Agent from '../Agent'

const items = []

const moveToClosestEnemy = new Task({
  run: agent => agent.closestEnemy && agent.moveTo.condition({ other: agent.closestEnemy, distance: -5 }) ? agent.moveTo.effect({ other: agent.closestEnemy, distance: -5 }) : FAILURE
})

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
    moveToClosestEnemy
  ]
})
const tree = new Selector({
  nodes: [
    attackEnemy,
    goToEnemy,
    'moveRandom',
    'idle'
  ]
})

class Goldbugs extends Agent {
  constructor(id, options) {
    super(id, options)
    this.health = options.health ?? Math.round(Math.random() * 2 + 1)
    this.usd = options.usd ?? Math.round(Math.random() * 4 + 1)
    this.item = options.item || items.find(item => item.chance >= Math.random())
    this.senseRadius = Math.round(Math.random() * 30) + 10
  }

  enemy = true
  spriteId = 'goldbugs'
  spriteData = goldbugSprite
  w = 10
  h = 10

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  attack = {
     // in biting distance
    condition: () => this.closestEnemy && intersects(this.getBoundingBox(), this.closestEnemy.getBoundingBox()),
    effect: () => {
      if (this.getCenter().x > this.closestEnemy.getCenter().x) {
        this.direction = 'left'
      } else {
        this.direction = 'right'
      }
      this.kneels = this.closestEnemy.status === 'rekt'

      if (this.status === 'attack' && this.frame === 3) {
        return this.closestEnemy.hurt(1, this.direction === 'left' ? 'right' : 'left', this)
      }
      if (this.status === 'attack') return SUCCESS

      this.frame = 0
      this.status = 'attack'

      return SUCCESS
    }
  }

  onHurt = () => playSound('goldbugsHurt')

  update = () => {
    if (CTDLGAME.lockCharacters) {
      this.draw()
      return
    }

    this.applyPhysics()

    if (!/rekt|hurt|spawn/.test(this.status)) {
      this.sensedEnemies = senseCharacters(this)
      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.bTree.step()
    }

    if (this.status === 'fall') this.status = 'idle'

    if (this.protection > 0) {
      this.protection--
    }
    this.frame++
    if (this.status === 'hurt' && this.frame === 3) {
      this.status = 'idle'
    }
    if (this.status === 'rekt' && this.frame === 5) {
      this.remove = true
    }

    this.draw()
  }

  getBoundingBox = () => ({
    id: this.id,
    x: this.x,
    y: this.y,
    w: this.w,
    h: this.h + 10
  })

  getAnchor = () => ({
    x: this.getBoundingBox().x,
    y: this.getBoundingBox().y + this.getBoundingBox().h,
    w: this.getBoundingBox().w,
    h: 1
  })
}

export default Goldbugs
