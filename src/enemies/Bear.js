import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

import bearSprite from '../sprites/bear'
import Item from '../Item'
import { CTDLGAME } from '../gameUtils'
import { moveObject, intersects, getClosest } from '../geometryUtils'
import { addTextToQueue, setTextQueue } from '../textUtils'
import constants from '../constants'
import { playSound } from '../sounds'
import { senseCharacters } from './enemyUtils'
import { getSoundtrack, initSoundtrack } from '../soundtrack'
import Agent from '../Agent'

const items = [
  { id: 'honeybadger', chance: 1 }
]

const moveToClosestEnemy = new Task({
  run: agent => agent.closestEnemy && agent.moveTo.condition({ other: agent.closestEnemy, distance: -1 }) ? agent.moveTo.effect({ other: agent.closestEnemy, distance: -1 }) : FAILURE
})

// Sequence: runs each node until fail
const attackEnemy = new Sequence({
  nodes: [
    'touchesEnemy',
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
    attackEnemy,
    goToEnemy,
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
    this.canMove = options.canMove
  }

  spriteId = 'bear'
  spriteData = bearSprite
  enemy = true
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
      const hasMoved =  moveObject(this, { x: -this.walkingSpeed, y: 0 }, CTDLGAME.quadTree)

      if (hasMoved) {
        this.status = 'move'
        if (this.frame % 5 === 0) playSound('drop')
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

      const hasMoved = moveObject(this, { x: this.walkingSpeed , y: 0}, CTDLGAME.quadTree)
      if (hasMoved) {
        this.status = 'move'
        if (this.frame % 5 === 0) playSound('drop')
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
        playSound('bearGrowl')
      }
      if (this.status === 'attack' && this.frame === 5) {
        playSound('woosh')
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

  onHurt = () => playSound('bearHurt')

  hurt = (dmg, direction) => {
    if (!this.hurtCondition(dmg, direction)) return

    if (dmg < 2 && Math.random() < .9) {
      if (Math.random() < .1) this.status = 'block'
      return
    } else if (dmg >= 2 && Math.random() < .3) {
      return
    }

    this.dmgs.push({y: -8, dmg})
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

    setTextQueue([])
    addTextToQueue('Big Bear:\n*growl*', () => this.frame++)
    addTextToQueue(`The Big Bear got rekt\nthe bull run begins!`, () => {
      initSoundtrack(CTDLGAME.world.map.track())

      if (this.item) {
        let item = new Item(
          this.item.id,
          {
            x: this.x,
            y: this.y,
            vy: -8,
            vx: Math.round((Math.random() - .5) * 10)
          }
        )
        CTDLGAME.objects.push(item)
      }
    })
  }

  die = () => {
    this.status = 'rekt'
    return this.onDie()
  }

  update = () => {
    if (this.vx !== 0) {
      if (this.vx > 6) this.vx = 6
      if (this.vx < -6) this.vx = -6

      moveObject(this, { x: this.vx , y: 0 }, CTDLGAME.quadTree)
      if (this.vx < 0) this.vx += 1
      if (this.vx > 0) this.vx -= 1
    }
    if (this.vy !== 0 && this.inViewport) {
      if (this.vy > 12) this.vy = 12
      if (this.vy < -12) this.vy = -12
      const hasCollided = !moveObject(this, { x: 0 , y: this.vy }, CTDLGAME.quadTree)

      if (hasCollided) this.vy = 0
    }

    this.sensedEnemies = senseCharacters(this)

    if (!this.hadIntro && this.sensedEnemies.length > 0) {
      CTDLGAME.lockCharacters = true
      constants.BUTTONS.find(btn => btn.action === 'skipCutScene').active = true

      playSound('bearGrowl')
      addTextToQueue('Big Bear:\n*rraawww*', () => {
        this.canMove = true
        CTDLGAME.lockCharacters = false
        constants.BUTTONS.find(btn => btn.action === 'skipCutScene').active = false
      })
      this.hadIntro = true
    }

    // AI logic
    if (Math.abs(this.vy) < 3 && this.canMove && !/rekt|spawn/.test(this.status)) {
      if (getSoundtrack() !== 'bear') initSoundtrack('bear')

      this.closestEnemy = getClosest(this, this.sensedEnemies)
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