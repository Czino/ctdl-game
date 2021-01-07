import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

import bagholder from '../sprites/bagholder'
import { CTDLGAME } from '../gameUtils'
import { moveObject, intersects, getClosest } from '../geometryUtils'
import { write } from '../font'
import constants from '../constants'
import { playSound } from '../sounds'
import { senseCharacters } from './enemyUtils'
import Agent from '../Agent'
import { addTextToQueue } from '../textUtils'

const sprites = {
  bagholder
}
const items = [
  { id: 'pizza', chance: 0.05 },
  { id: 'taco', chance: 0.02 }
]

const touchesEnemy = new Task({
  run: agent => agent.status === 'attack' || agent.closestEnemy && intersects(agent.getBoundingBox(), agent.closestEnemy.getBoundingBox()) ? SUCCESS : FAILURE
})
const moveToClosestEnemy = new Task({
  run: agent => agent.closestEnemy && agent.moveTo.condition({ other: agent.closestEnemy, distance: -1 }) ? agent.moveTo.effect({ other: agent.closestEnemy, distance: -1 }) : FAILURE
})

// Sequence: runs each node until fail
const attackEnemy = new Sequence({
  nodes: [
    touchesEnemy,
    'attack'
  ]
})

// Selector: runs until one node calls success
const goToEnemy = new Selector({
  nodes: [
    touchesEnemy,
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

class Bagholder extends Agent {
  constructor(id, options) {
    super(id, options)
    this.health = options.health ?? Math.round(Math.random() * 17 + 5)
    this.usd = options.usd ?? Math.round(Math.random() * 8 + 1)
    this.item = options.item || items.find(item => item.chance >= Math.random())
    this.senseRadius = options.senseRadius || Math.round(Math.random() * 50) + 30
    this.crawls = options.crawls || Math.random() < .1
    this.walkingSpeed = this.crawls ? 1 : 2
    this.protection = 0
  }

  enemy = true
  w = 20
  h = 30
  strength = 2
  spriteData = sprites.bagholder

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })


  moveLeft = {
    condition: () => true,
    effect: () => {
      this.direction = 'left'
      this.isMoving = 'left'
      const hasMoved = !moveObject(this, { x: -this.walkingSpeed, y: 0 }, CTDLGAME.quadTree)

      if (hasMoved) {
        this.status = this.crawls ? 'crawl' : 'move'
        return SUCCESS
      }
      return FAILURE
    }
  }
  moveRight = {
    condition: () => true,
    effect: () => {
      this.direction = 'right'
      this.isMoving = 'right'

      const hasMoved = !moveObject(this, { x: this.walkingSpeed , y: 0}, CTDLGAME.quadTree)
      if (hasMoved) {
        this.status = this.crawls ? 'crawl' : 'move'
        return SUCCESS
      }

      return FAILURE
    }
  }
  attack = {
    condition: () => !this.crawls && this.closestEnemy && intersects(this.getBoundingBox(), this.closestEnemy.getBoundingBox()),
    effect: () => {
      if (this.getCenter().x > this.closestEnemy.getCenter().x) {
        this.direction = 'left'
      } else {
        this.direction = 'right'
      }

      if (this.status === 'attack' && this.frame === 7) {
        return this.closestEnemy.hurt(this.strength, this.direction === 'left' ? 'right' : 'left', this)
      }
      if (this.status === 'attack') return SUCCESS

      this.frame = 0
      this.status = 'attack'

      return SUCCESS
    }
  }

  onHurt = () => {
    this.protection = 8
    playSound('shitcoinerHurt')
  }
  onDie = () => {
    addTextToQueue(`${this.getClass()} got rekt,\nyou found $${this.usd}`)
    playSound('shitcoinerHurt')
    playSound('burn')
  }

  update = () => {
    if (!this.sprite) this.sprite = CTDLGAME.assets.bagholder

    if (CTDLGAME.lockCharacters) {
      let data = this.spriteData[this.direction][this.status][0]
      constants.charContext.globalAlpha = 1

      constants.charContext.drawImage(
        this.sprite,
        data.x, data.y, this.w, this.h,
        this.x, this.y, this.w, this.h
      )
      return
    }

    this.applyPhysics()

    if (this.crawls) {
      if (this.status === 'hurt') this.status = 'idle'
      if (this.status === 'idle') {
        this.status = 'crawl'
        this.frame = 0
      }
      if (this.status === 'rekt') this.remove = true
    }

    if (this.status === 'hurt' && this.protection === 6) this.status = 'idle'

    if (this.status === 'attack' && this.frame === 11) this.status = 'idle'

    if (this.status === 'rekt' && this.frame === 12) this.remove = true

    if (Math.abs(this.vy) < 3 && !/fall|rekt|hurt/.test(this.status)) {
      this.sensedEnemies = senseCharacters(this)
      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.bTree.step()
    }

    this.frame++
    this.draw()

    this.dmgs = this.dmgs
      .filter(dmg => dmg.y > -24)
      .map(dmg => {
        write(constants.gameContext, `-${dmg.dmg}`, {
          x: this.getCenter().x - 6,
          y: this.y + dmg.y,
          w: 12
        }, 'center', false, 4, true, '#F00')
        return {
          ...dmg,
          y: dmg.y - 1
        }
      })
  }

  getBoundingBox = () => this.crawls
    ? ({
      id: this.id,
      x: this.x,
      y: this.y + 18,
      w: this.w,
      h: this.h - 18
    })
    : ({
      id: this.id,
      x: this.x + 5,
      y: this.y + 6,
      w: this.w - 10,
      h: this.h - 6
    })

  getAnchor = () => this.crawls
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

export default Bagholder
