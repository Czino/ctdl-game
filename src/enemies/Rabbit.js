import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE, RUNNING } from '../../node_modules/behaviortree/dist/index.node'

import rabbitSprite from '../sprites/rabbit'
import { CTDLGAME } from '../gameUtils'
import { intersects, getClosest } from '../geometryUtils'
import constants from '../constants'
import { senseCharacters } from './enemyUtils'
import Agent from '../Agent'
import { addTextToQueue } from '../textUtils'

const isEvil = new Task({
  run: agent => agent.isEvil ? SUCCESS : FAILURE
})
const isSpecial = new Task({
  run: agent => agent.isSpecial ? SUCCESS : FAILURE
})
const isGood = new Task({
  run: agent => !agent.isEvil ? SUCCESS : FAILURE
})

const moveToClosestEnemy = new Task({
  run: agent => agent.closestEnemy && agent.moveTo.condition({ other: agent.closestEnemy, distance: -1 }) ? agent.moveTo.effect({ other: agent.closestEnemy, distance: -1 }) : FAILURE
})
const disappear = new Task({
  run: agent => {
    if (!agent.disappearing && Math.random() > .01) return FAILURE
    let action = 'moveRandom'
    // if already moving, continue journey
    agent.disappearing = agent.disappearing || 1
    agent.y += 1
    agent.disappearing++
    agent.brightness -= 0.03
    if (agent.disappearing > agent.getBoundingBox().h) agent.remove = true
    if (agent.isMoving === 'left')  action = 'moveLeft'
    if (agent.isMoving === 'right')  action = 'moveRight'
    return agent[action].condition() ? agent[action].effect() : FAILURE
  }
})

// Sequence: runs each node until fail
const attackEnemy = new Sequence({
  nodes: [
    'canAttackEnemy',
    'attack'
  ]
})

// Selector: runs until one node calls success
const goToEnemy = new Selector({
  nodes: [
    'canAttackEnemy',
    moveToClosestEnemy,
    'jump'
  ]
})
const runAway = new Selector({
  nodes: [
    'runAwayFromClosestEnemy',
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
        disappear,
        'moveRandom',
        'jump',
        'idle'
      ]
    })
  ]
})
const specialSequence = new Sequence({
  nodes: [
    isSpecial,
    new Selector({
      nodes: [
        disappear,
        'moveRandom',
        'jump',
        'idle'
      ]
    })
  ]
})
const tree = new Selector({
  nodes: [
    evilSequence,
    specialSequence,
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
    this.isSpecial = options.isSpecial ?? false
    this.glows = options.glows ?? false
    this.frame = options.frame || 0
    this.walkingSpeed = options.walkingSpeed || Math.round(Math.random() * 3 + 4)
    this.senseRadius = Math.round(Math.random() * 50 + 30)
  }

  activity = .05
  spriteId = 'rabbit'
  spriteData = rabbitSprite.special
  item = null
  w = 8
  h = 6
  turnEvilRate = 0.1 // will be squared, so 0.01


  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  turnEvil = {
    condition: () => !this.isSpecial && (this.status === 'turnEvil' || (!this.isEvil && this.canTurnEvil && Math.random() < this.turnEvilRate)),
    effect: () => {
      this.status = 'turnEvil'
      return SUCCESS
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
        this.closestEnemy.hurt(.5, this.direction === 'left' ? 'right' : 'left', this)
        return SUCCESS
      }
      if (this.status === 'attack') return RUNNING
  
      this.status = 'attack'
      return SUCCESS
    }
  }

  canJump = () => {
    let onGround = this.getAnchor()
    let jumpTo = this.getBoundingBox()
    jumpTo.y -= 4
    jumpTo.x -= this.direction === 'right' ? 3 : -3

    let obstacles = CTDLGAME.quadTree.query(onGround)
      .filter(obj => obj.isSolid && !obj.enemy)
      .filter(obj => intersects(obj, onGround))

    if (obstacles.length === 0) return false // not on ground

    if (window.DRAWSENSORS) {
      constants.overlayContext.fillStyle = 'red'
      constants.overlayContext.fillRect(jumpTo.x, jumpTo.y, jumpTo.w, jumpTo.h)
    }

    obstacles = CTDLGAME.quadTree.query(jumpTo)
      .filter(obj => obj.isSolid && !obj.enemy)
      .filter(obj => intersects(obj, jumpTo))

      return obstacles.length === 0
  }

  hurtCondition = () => !/turnEvil|spawn|hurt|rekt/.test(this.status)
  onHurt = () => window.SOUND.playSound('rabbitHurt')
  onDie = () => {
    window.SOUND.playSound('burn')
    addTextToQueue(`Evil Rabbit got rekt`)
  }

  update = () => {
    if (this.isSpecial && this.status === 'turnEvil') this.status = 'idle'

    if (CTDLGAME.lockCharacters) {
      constants.charContext.globalAlpha = 1

      this.spriteData = rabbitSprite[this.isEvil ? 'evil' : this.isSpecial ? 'special' : 'good']
      this.draw()
      return
    }

    this.applyPhysics()

    // cleanup out of world
    if (CTDLGAME.world.map.removeEnemy && Math.random() < .025) {
      const touchesRemoveBlock = CTDLGAME.world.map.removeEnemy.some(block => intersects(block, this.getBoundingBox()))
      if (touchesRemoveBlock) this.remove = true
    }
    if (!this.isSpecial && CTDLGAME.lightSources) {
      const touchesLightSource = CTDLGAME.lightSources.some(source => intersects(source, this.getBoundingBox()))
      if (touchesLightSource) {
        this.canTurnEvil = false
        this.isEvil = false
        this.enemy = false
        this.isSpecial = true
        this.glows = true
      }
    }

    // AI logic
    if (this.turnEvil.condition()) {
      this.turnEvil.effect()
    } else if (Math.abs(this.vy) < 3 && !/turnEvil|jump|spawn|hurt|fall|rekt/.test(this.status)) {
      this.sensedEnemies = senseCharacters(this)
      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.bTree.step()
    }

    if (this.protection > 0) {
      this.protection--
    }
    if (this.status !== 'idle' || Math.random() < .1) this.frame++
    if (this.status === 'hurt' && this.frame === 3) {
      this.status = 'idle'
    }
    if (this.status === 'spawn' && this.frame === 6) {
      this.status = 'idle'
    }
    if (this.isSpecial && this.status === 'spawn') this.status = 'idle'
    if (this.status === 'turnEvil' && this.frame === 3 && Math.random() < .5) {
      this.isEvil = true
      this.enemy = true
      this.status = 'idle'
    }
    if (this.status === 'rekt' && this.frame === 3) {
      this.remove = true
    }

    this.spriteData = rabbitSprite[this.isEvil ? 'evil' : this.isSpecial ? 'special' : 'good']

    if (this.frame >= this.spriteData[this.direction][this.status].length) {
      this.frame = 0
      if (/jump/.test(this.status)) this.status = 'idle'
    }

    this.draw()
  }

  getAnchor = () => ({
    x: this.getBoundingBox().x,
    y: this.getBoundingBox().y + this.getBoundingBox().h - 1,
    w: this.getBoundingBox().w,
    h: 1
  })

  getLightSource = () => ({
    x: this.getBoundingBox().x + Math.round(this.getBoundingBox().w / 2),
    y: this.getBoundingBox().y + Math.round(this.getBoundingBox().h / 2),
    color: '#8b0a89',
    brightness: .3
  })
}
export default Rabbit