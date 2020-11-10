import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE, RUNNING } from '../../node_modules/behaviortree/dist/index.node'

import rabbit from '../sprites/rabbit'
import { CTDLGAME } from '../gameUtils'
import { moveObject, intersects, getClosest } from '../geometryUtils'
import { write } from '../font'
import constants from '../constants'
import { playSound } from '../sounds'
import { senseCharacters } from './enemyUtils'
import Agent from '../Agent'
import { addTextToQueue } from '../textUtils'

const sprites = {
  rabbit
}

const isEvil = new Task({
  run: agent => agent.isEvil ? SUCCESS : FAILURE
})
const isGood = new Task({
  run: agent => !agent.isEvil ? SUCCESS : FAILURE
})

const touchesEnemy = new Task({
  // in biting distance
  run: agent => agent.attack.condition() ? SUCCESS : FAILURE
})
const moveToClosestEnemy = new Task({
  run: agent => agent.closestEnemy && agent.moveTo.condition({ other: agent.closestEnemy, distance: -1 }) ? agent.moveTo.effect({ other: agent.closestEnemy, distance: -1 }) : FAILURE
})

const runAwayFromClosestEnemy = new Task({
  run: agent => agent.closestEnemy && agent.runAwayFrom.condition({ other: agent.closestEnemy })
    ? agent.runAwayFrom.effect({ other: agent.closestEnemy })
    : FAILURE
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
    'jump'
  ]
})
const runAway = new Selector({
  nodes: [
    runAwayFromClosestEnemy,
    'jump'
 ]
})
const runAwayFromEnemy = new Sequence({
  nodes: [
    'seesEnemy',
    runAway
  ]
})
const evilSequence = new Sequence({
  nodes: [
    isEvil,
    new Selector({
      nodes: [
        attackEnemy,
        goToEnemy,
        'moveRandom',
        'idle'
      ]
    })
  ]
})
const goodSequence = new Sequence({
  nodes: [
    isGood,
    new Selector({
      nodes: [
        runAwayFromEnemy,
        'moveRandom',
        'idle'
      ]
    })
  ]
})
const tree = new Selector({
  nodes: [
    evilSequence,
    goodSequence
  ]
})

class Rabbit extends Agent {
  constructor(id, options) {
    super(id, options)
    this.enemy = options.isEvil ?? false
    this.health = options.health ?? Math.round(Math.random() * 2 + 1)
    this.canTurnEvil = options.canTurnEvil || Math.random() > .5
    this.isEvil = options.isEvil ?? false
    this.frame = options.frame || 0
    this.walkingSpeed = options.walkingSpeed || Math.round(Math.random() * 3 + 4)
    this.senseRadius = Math.round(Math.random() * 50 + 30)
  }

  class = 'Rabbit'
  spriteData = sprites.rabbit
  item = null
  w = 8
  h = 6
  turnEvilRate = 0.1 // will be squared, so 0.01


  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  idle = {
    condition: () => true,
    effect: () => {
      this.status = 'idle'
      return SUCCESS
    }
  }
  turnEvil = {
    condition: () => this.status === 'turnEvil' || (!this.isEvil && this.canTurnEvil && Math.random() < this.turnEvilRate),
    effect: () => {
      this.status = 'turnEvil'
      return SUCCESS
    }
  }
  moveLeft = {
    condition: () => true,
    effect: () => {
      this.direction = 'left'
      const hasMoved =  moveObject(this, { x: -this.walkingSpeed, y: 0 }, CTDLGAME.quadTree)

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
      this.direction = 'right'

      const hasMoved = moveObject(this, { x: this.walkingSpeed , y: 0}, CTDLGAME.quadTree)

      if (hasMoved) {
        this.status = 'move'
        return SUCCESS
      }

      return FAILURE
    }
  }
  jump = {
    condition: () => this.canJump(),
    effect: () => {
      this.status = 'jump'

      this.vx = this.direction === 'right' ? 3 : -3
      this.vy = -6

      return SUCCESS
    }
  }
  attack = {
    condition: () => this.closestEnemy && intersects(this.getBoundingBox(), this.closestEnemy.getBoundingBox()),
    effect: () => {
      if (this.status === 'attack' && this.frame === 2) {
        this.frame = 0
        this.closestEnemy.hurt(.5, this.direction === 'left' ? 'right' : 'left')
        return SUCCESS
      }
      if (this.status === 'attack') return RUNNING
  
      this.status = 'attack'
      return SUCCESS
    }
  }

  canJump = () => {
    let jumpTo = this.getBoundingBox()
    jumpTo.y -= 4
    jumpTo.x -= this.direction === 'right' ? 3 : -3

    if (window.DRAWSENSORS) {
      constants.overlayContext.fillStyle = 'red'
      constants.overlayContext.fillRect(jumpTo.x, jumpTo.y, jumpTo.w, jumpTo.h)
    }
    let obstacles = CTDLGAME.quadTree.query(jumpTo)
      .filter(obj => obj.isSolid && !obj.enemy)
      .filter(obj => intersects(obj, jumpTo))

    return obstacles.length === 0
  }

  hurtCondition = () => this.isEvil && !/turnEvil|spawn|hurt|rekt/.test(this.status)
  onHurt = () => playSound('rabbitHurt')
  onDie = () => {
    playSound('burn')
    addTextToQueue(`Evil Rabbit got rekt`)
  }

  update = () => {
    const sprite = CTDLGAME.assets.rabbit

    if (CTDLGAME.lockCharacters) {
      let data = this.spriteData[this.isEvil ? 'evil' : 'good'][this.direction][this.status][0]
      constants.charContext.globalAlpha = 1

      constants.charContext.drawImage(
        sprite,
        data.x, data.y, this.w, this.h,
        this.x, this.y, this.w, this.h
      )
      return
    }

    this.applyPhysics()

    if (CTDLGAME.world.map.removeEnemy) {
      const touchesRemoveBlock = CTDLGAME.world.map.removeEnemy.some(block => intersects(block, this.getBoundingBox()))
      if (touchesRemoveBlock) this.remove = true
    }

    // AI logic
    if (this.turnEvil.condition()) {
      this.turnEvil.effect()
    } else if (!/turnEvil|spawn|hurt|fall|rekt/.test(this.status) && this.vy === 0) {
      this.sensedEnemies = senseCharacters(this)
      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.bTree.step()
    }

    let spriteData = this.spriteData[this.isEvil ? 'evil' : 'good'][this.direction][this.status]

    if (this.status !== 'idle' || Math.random() < .1) this.frame++
    if (this.status === 'hurt' && this.frame === 3) {
      this.status = 'idle'
    }
    if (this.status === 'spawn' && this.frame === 6) {
      this.status = 'idle'
    }
    if (this.status === 'turnEvil' && this.frame === 3 && Math.random() < .5) {
      this.isEvil = true
      this.enemy = true
      this.status = 'idle'
    }
    if (this.status === 'rekt' && this.frame === 3) {
      this.remove = true
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

  getAnchor = () => ({
      x: this.getBoundingBox().x,
      y: this.getBoundingBox().y + this.getBoundingBox().h,
      w: this.getBoundingBox().w,
      h: 1
  })
}
export default Rabbit