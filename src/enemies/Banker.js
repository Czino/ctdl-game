import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

import spriteData from '../sprites/banker'
import { CTDLGAME } from '../gameUtils'
import { getClosest, moveObject } from '../geometryUtils'
import { senseCharacters } from './enemyUtils'
import Agent from '../Agent'
import { addTextToQueue } from '../textUtils'
import { canDrawOn } from '../performanceUtils'
import constants from '../constants'

const items = [
  { id: 'pizza', chance: 0.03 },
  { id: 'taco', chance: 0.03 }
]

const slide = new Task({
  run: agent => agent.slide.condition() ? agent.slide.effect() : FAILURE
})
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
const goToEnemy = new Selector({
  nodes: [
    'touchesEnemy',
    moveToClosestEnemy
  ]
})

const tree = new Selector({
  nodes: [
    slide,
    attackEnemy,
    goToEnemy,
    'moveRandom',
    'idle'
  ]
})

class Banker extends Agent {
  constructor(id, options) {
    super(id, options)
    this.health = options.health ?? Math.round(Math.random() * 207 + 107)
    this.maxHealth = options.maxHealth || this.health
    this.usd = options.usd ?? Math.round(Math.random() * 34000 + 5000)
    this.item = options.item || items.find(item => item.chance >= Math.random())
    this.senseRadius = options.senseRadius || Math.round(Math.random() * 20) + 30
  }

  enemy = true
  w = 16
  h = 30
  spriteId = 'banker'
  spriteData = spriteData

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  slide = {
    condition: () => this.status === 'slide' && this.goalX,
    effect: () => {
      let vx = 0
      
      if (this.direction === 'left' && this.x > this.goalX) {
        vx = this.walkingSpeed * -3
      } else if (this.direction === 'right' && this.x < this.goalX) {
        vx = this.walkingSpeed * 3
      } else {
        this.status = 'idle'
        this.goalX = null
      }

      const hasMoved = !moveObject(this, { x: vx , y: 0}, CTDLGAME.quadTree)

      if (hasMoved) {
        return SUCCESS
      }

      this.status = 'idle'
      this.goalX = null
      return FAILURE
    }
  }

  drawShadow = () => {
    if (!canDrawOn(this.context)) return
    if (!this.sprite && this.spriteId) this.sprite = CTDLGAME.assets[this.spriteId]
    let spriteData = this.spriteData[this.direction][this.status]

    if (this.frame >= spriteData.length) {
      this.frame = 0
    }

    let data = spriteData[this.frame]
    this.w = data.w
    this.h = data.h

    for (let i = 0; i < 6; i+=2) {
      let x = this.direction === 'right' ? this.x - i : this.x + i
      constants[this.context].globalAlpha = 1 / (i / 2)

      constants[this.context].drawImage(
        this.sprite,
        data.x, data.y, this.w, this.h,
        x, this.y, this.w, this.h
      )
    }
    constants[this.context].globalAlpha = 1

  }

  hurtCondition = () => !/hurt|rekt|slide/.test(this.status) && !this.protection

  onHurt = () => {
    if (Math.random() < .25) {
      this.status = 'slide'
      this.goalX = this.direction === 'right' ? this.x + 8 * 3 : this.x - 8 * 3
    } else {
      this.protection = 8
    }
    window.SOUND.playSound('shitcoinerHurt')
  }
  onDie = () => {
    window.SOUND.playSound('shitcoinerHurt')
    addTextToQueue(`Crony banker got rekt,\nyou found $${this.usd}`)
  }
  update = () => {
    if (CTDLGAME.lockCharacters) {
      this.draw()
      return
    }

    this.applyPhysics()

    if (Math.abs(this.vy) < 3 && !/back|fall|rekt|hurt|spawn/.test(this.status)) {
      this.sensedEnemies = senseCharacters(this)
      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.bTree.step()
    }

    if (this.status === 'hurt' && this.protection <= 6) {
      this.status = 'idle'
    }
    this.frame++
   
    if (this.status === 'slide') this.drawShadow()
    this.draw()
  }

  getBoundingBox = () => ({
    id: this.id,
    x: this.x + 5,
    y: this.y + 6,
    w: this.w - 10,
    h: this.h - 6
  })

  getAnchor = () => this.status !== 'rekt'
    ? ({
        x: this.getBoundingBox().x + 2,
        y: this.getBoundingBox().y + this.getBoundingBox().h - 1,
        w: this.getBoundingBox().w - 5,
        h: 1
    })
    : ({
      x: this.getBoundingBox().x,
      y: this.getBoundingBox().y + this.getBoundingBox().h - 1,
      w: this.getBoundingBox().w,
      h: 1
  })
}

export default Banker
