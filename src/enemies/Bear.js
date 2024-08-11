import { BehaviorTree, FAILURE, SUCCESS, Selector, Sequence, Task } from '../../node_modules/behaviortree/dist/index.node'

import Agent from '../Agent'
import constants from '../constants'
import { CTDLGAME } from '../gameUtils'
import { intersects, moveObject } from '../geometryUtils'
import bearSprite from '../sprites/bear'

const items = [
  { id: 'honeybadger', chance: 1 }
]

const moveToClosestEnemy = new Task({
  run: agent => agent.closestEnemy && agent.moveTo.condition({ other: agent.closestEnemy, distance: -1 }) ? agent.moveTo.effect({ other: agent.closestEnemy, distance: -1 }) : FAILURE
})

// Sequence: runs each node until fail
const attackEnemy = new Sequence({
  nodes: [
    'canAttackEnemy',
    'attack'
  ]
})

// Selector: runs until one node calls success
const goToEnemy = new Sequence({
  nodes: [
    'seesEnemy',
    'doesNotTouchEnemy',
    moveToClosestEnemy
  ]
})
 const tree = new Selector({
  nodes: [
    'moveRandom',
    'idle'
  ]
 })

class Bear extends Agent {
  constructor(id, options) {
    super(id, options)
    this.health = options.health ?? Math.round(Math.random() * 20 + 40)
    this.item = options.item || items.find(item => item.chance >= Math.random())
    this.hadIntro = options.hadIntro
    this.canMove = true
  }

  spriteId = 'bear'
  spriteData = bearSprite
  enemy = true
  boss = true
  w = 27
  h = 28
  walkingSpeed = 2
  attackRange = 5
  senseRadius = 160

  idle = {
    condition: () => true,
    effect: () => {
      this.status = 'idle'
      return SUCCESS
    }
  }
  moveLeft = {
    condition: () => true,
    effect: () => {
      this.direction = 'left'
      this.isMoving = 'left'
      const hasMoved = !moveObject(this, { x: -this.walkingSpeed, y: 0 }, CTDLGAME.quadTree)

      if (hasMoved) {
        this.status = 'move'
        return SUCCESS
      }
      return false
    }
  }
  moveRight = {
    condition: () => true,
    effect: () => {
      this.direction = 'right'
      this.isMoving = 'right'

      const hasMoved = !moveObject(this, { x: this.walkingSpeed , y: 0}, CTDLGAME.quadTree)
      if (hasMoved) {
        this.status = 'move'
        return SUCCESS
      }
      return false
    }
  }
  attack = {
    condition: () => {
      if (!this.closestEnemy) return
      const attackBox = {
        x: this.getBoundingBox('attack').x - this.attackRange,
        y: this.getBoundingBox('attack').y + 7,
        w: this.getBoundingBox('attack').w + this.attackRange * 2,
        h: 9
      }

      if (window.DRAWSENSORS) {
        constants.overlayContext.globalAlpha = .5
        constants.overlayContext.fillStyle = 'red'
        constants.overlayContext.fillRect(attackBox.x, attackBox.y, attackBox.w, attackBox.h)
      }

      // attack distance
      return intersects(attackBox, this.closestEnemy.getBoundingBox())
    },
    effect: () => {
      if (this.getCenter().x > this.closestEnemy.getCenter().x) {
        this.direction = 'left'
      } else {
        this.direction = 'right'
      }
      if (this.status === 'attack' && this.frame === 2) {
      }
      if (this.status === 'attack' && this.frame === 5) {
        let dmg = Math.round(Math.random() * 2) + 5
        this.closestEnemy.hurt(dmg, this.direction === 'left' ? 'right' : 'left', this)
        return SUCCESS
      }
      if (this.status === 'attack') return SUCCESS

      this.frame = 0
      this.status = 'attack'
      return SUCCESS
    }
  }

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })


  hurt = (dmg, direction) => {
    if (!this.hurtCondition(dmg, direction)) return

    if (dmg < 2 && Math.random() < .9) {
      if (Math.random() < .1) this.status = 'block'
      return
    } else if (dmg >= 2 && Math.random() < .3) {
      return
    }

    this.dmgs.push({
      x: Math.round((Math.random() - .5) * 8),
      y: -8,
      dmg: Math.ceil(dmg)
    })
    this.health = Math.max(this.health - dmg, 0)

    if (dmg > 2 && Math.random() < .5) {
      this.status = 'hurt'
      this.vy = -8
      this.vx = direction === 'left' ? 4 : -4
    }

    if (this.health <= 0) {
      this.health = 0
      return this.die()
    }

    return this.onHurt()
  }

  onDie = () => {
    this.frame = 0

  }

  die = () => {
    this.status = 'rekt'
    return this.onDie()
  }

  update = () => {
    // AI logic
    if (Math.abs(this.vy) < 3 && this.canMove && !/rekt|spawn/.test(this.status)) {
      this.bTree.step()
    }

    if (!/rekt/.test(this.status)) this.frame++
    if (this.status === 'hurt' && this.frame === 3) this.status = 'idle'
    if (this.status === 'block' && Math.random() < .3) this.status = 'idle'

    this.draw()
  }

  getBoundingBox = status => /idle|move/.test(status || this.status)
    ? ({
      id: this.id,
      x: this.x,
      y: this.y + 12,
      w: this.w,
      h: this.h - 12
    })
    : ({
      id: this.id,
      x: this.x + 5,
      y: this.y + 5,
      w: this.w - 8,
      h: this.h - 5
    })

  getAnchor = () => /idle|move/.test(this.status)
    ? ({
        x: this.getBoundingBox().x + 7,
        y: this.getBoundingBox().y + this.getBoundingBox().h - 1,
        w: this.getBoundingBox().w - 14,
        h: 1
    })
    : ({
      x: this.getBoundingBox().x,
      y: this.getBoundingBox().y + this.getBoundingBox().h - 1,
      w: this.getBoundingBox().w,
      h: 1
  })
}

export default Bear