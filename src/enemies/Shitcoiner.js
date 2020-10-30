import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE, RUNNING } from '../../node_modules/behaviortree/dist/index.node'

import shitcoiner from '../sprites/shitcoiner'
import { CTDLGAME } from '../gameUtils'
import { moveObject, intersects, getClosest } from '../geometryUtils'
import { write } from '../font'
import constants from '../constants'
import { playSound } from '../sounds'
import { senseCharacters } from './enemyUtils'
import Agent from '../Agent'

const sprites = {
  shitcoiner
}
const items = [
  { id: 'pizza', chance: 0.05 },
  { id: 'taco', chance: 0.02 },
  { id: 'opendime', chance: 0.01 }
]

const climb = new Task({
  run: agent => agent.climb.condition() ? agent.climb.effect() : FAILURE
})

const touchesEnemy = new Task({
   // in biting distance
  run: agent => agent.closestEnemy && intersects(agent.getBoundingBox(), agent.closestEnemy.getBoundingBox()) ? SUCCESS : FAILURE
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
    moveToClosestEnemy,
    climb
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

class Shitcoiner extends Agent {
  constructor(id, options) {
    super(id, options)
    this.health = options.health ?? Math.round(Math.random() * 7 + 1)
    this.usd = options.usd ?? Math.round(Math.random() * 4 + 1)
    this.item = options.item || items.find(item => item.chance >= Math.random())
    this.senseRadius = Math.round(Math.random() * 50) + 30
  }

  class = 'Shitcoiner'
  enemy = true
  w = 16
  h = 30
  spriteData = sprites.shitcoiner
  kneels = false

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  moveLeft = {
    condition: () => true,
    effect: () => {
      this.kneels = false
      this.direction = 'left'
      const hasMoved = moveObject(this, { x: -this.walkingSpeed, y: 0 }, CTDLGAME.quadTree)

      if (hasMoved) {
        this.status = 'move'
        return SUCCESS
      }
      return FAILURE
    }
  }
  moveRight = {
    condition: () => true,
    effect: () => {
      this.kneels = false
      this.direction = 'right'

      const hasMoved = moveObject(this, { x: this.walkingSpeed , y: 0}, CTDLGAME.quadTree)
      if (hasMoved) {
        this.status = 'move'
        return SUCCESS
      }

      return FAILURE
    }
  }
  climb = {
    condition: () => this.canClimb(),
    effect: () => {
      this.status = 'climb'
      if (this.frame !== 10) return RUNNING
      moveObject(this, { x: this.direction === 'left' ? -3 : 3 , y: -6}, CTDLGAME.quadTree)
      this.status = 'idle'
      return SUCCESS
    }
  }
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
        return this.closestEnemy.hurt(1, this.direction === 'left' ? 'right' : 'left')
      }
      if (this.status === 'attack') return SUCCESS

      this.frame = 0
      this.status = 'attack'

      return SUCCESS
    }
  }

  canClimb = () => {
    const boundingBox = this.getBoundingBox()
    let climbOn = {
      x: boundingBox.x + (this.direction === 'right' ? boundingBox.w : -3),
      y: boundingBox.y + boundingBox.h - 6,
      w: 3,
      h: 6
    }

    let climbTo = {
      x: boundingBox.x + (this.direction === 'right' ? 3 : -3),
      y: boundingBox.y -6,
      w: boundingBox.w,
      h: boundingBox.h
    }

    if (window.DRAWSENSORS) {
      constants.overlayContext.globalAlpha = .5
      constants.overlayContext.fillStyle = 'red'
      constants.overlayContext.fillRect(climbOn.x, climbOn.y, climbOn.w, climbOn.h)
      constants.overlayContext.globalAlpha = 1
    }
    if (window.DRAWSENSORS) {
      constants.overlayContext.globalAlpha = .5
      constants.overlayContext.fillStyle = 'green'
      constants.overlayContext.fillRect(climbTo.x, climbTo.y, climbTo.w, climbTo.h)
      constants.overlayContext.globalAlpha = 1
    }

    let ground = CTDLGAME.quadTree.query(climbOn)
      .filter(obj => obj.isSolid)
      .filter(obj => intersects(obj, climbOn))
    let obstacles = CTDLGAME.quadTree.query(climbTo)
      .filter(obj => obj.isSolid)
      .filter(obj => intersects(obj, climbTo))

    return ground.length > 0 && obstacles.length === 0
  }

  onHurt = () => playSound('shitcoinerHurt')
  onDie = () => playSound('shitcoinerHurt')

  update = () => {
    const sprite = CTDLGAME.assets.shitcoiner

    if (CTDLGAME.lockCharacters) {
      let data = this.spriteData[this.direction][this.status][0]
      constants.charContext.globalAlpha = 1

      constants.charContext.drawImage(
        sprite,
        data.x, data.y, this.w, this.h,
        this.x, this.y, this.w, this.h
      )
      return
    }

    this.applyPhysics()

    if (!/fall|rekt|hurt|burning|spawn/.test(this.status) && this.vy === 0) {
      this.sensedEnemies = senseCharacters(this)
      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.bTree.step()
    }
    let spriteData = this.spriteData[this.direction][this.status]

    if (this.status !== 'rekt' && this.kneels) {
      spriteData = this.spriteData[this.direction][this.status + '-kneels']
    }

    this.frame++
    if (this.status === 'hurt' && this.frame === 3) {
      this.status = 'idle'
    }
    if (this.status === 'spawn' && this.frame === 3) {
      this.status = 'idle'
    }
    if (this.frame >= spriteData.length) {
      this.frame = 0
    }

    let data = spriteData[this.frame]
    this.w = data.w
    this.h = data.h

    constants.gameContext.drawImage(
      sprite,
      data.x, data.y, this.w, this.h,
      this.x, this.y, this.w, this.h
    )

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

export default Shitcoiner
