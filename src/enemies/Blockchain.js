import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

import blockchain from '../sprites/blockchain'
import { CTDLGAME, getBlockSubsidy } from '../gameUtils'
import { intersects, getClosest, moveObject, sharpLine } from '../geometryUtils'
import { playSound } from '../sounds'
import { sense, senseCharacters } from './enemyUtils'
import Agent from '../Agent'
import { canDrawOn } from '../performanceUtils'
import constants from '../constants'
import { addTextToQueue } from '../textUtils'

const items = []

const moveToClosestEnemy = new Task({
  run: agent => agent.closestEnemy && agent.moveTo.condition({ other: agent.closestEnemy, distance: -5 }) ? agent.moveTo.effect({ other: agent.closestEnemy, distance: -5 }) : FAILURE
})

const isLeader = new Task({
  run: agent => agent.isLeader() ? SUCCESS : FAILURE
})
const isNotLeader = new Task({
  run: agent => !agent.isLeader() ? SUCCESS : FAILURE
})

const getInLine = new Task({
  run: agent => {
    if (!agent.nextBlock) return FAILURE

    if (agent.blockHeight < agent.nextBlock.blockHeight) {
      agent.goal = agent.nextBlock.getBoundingBox().x + agent.nextBlock.getBoundingBox().w + 2
      if (Math.abs(agent.x - agent.goal) < 6) agent.goal = null
      if (agent.x < agent.goal) return agent.moveRight.condition() ? agent.moveRight.effect() : FAILURE
      if (agent.x > agent.goal) return agent.moveLeft.condition() ? agent.moveLeft.effect() : FAILURE
    }
    agent.goal = null
    return FAILURE
  }
})

// Selector: runs until one node calls success
const goToEnemy = new Selector({
  nodes: [
    'touchesEnemy',
    moveToClosestEnemy
  ]
})

// Sequence: runs each node until fail
const attackEnemy = new Sequence({
  nodes: [
    'touchesEnemy',
    'attack'
  ]
})

const attack = new Sequence({
  nodes: [
    isLeader,
    attackEnemy,
    goToEnemy
  ]
})

const follow = new Sequence({
  nodes: [
    isNotLeader,
    getInLine,
  ]
})

const tree = new Selector({
  nodes: [
    follow,
    attack,
    'moveRandom',
    'idle'
  ]
})

class Blockchain extends Agent {
  constructor(id, options) {
    super(id, options)
    this.senseRadius = 100
    this.walkingSpeed = 7
    this.business = .1
    this.type = options.type || (Math.random() > .5 ? 'queue' : 'mined')
    this.blockHeight = options.blockHeight || Math.round(Math.random() * CTDLGAME.blockHeight) + (this.type === 'mined' ? 0 : CTDLGAME.blockHeight)
    this.sats = options.sats ?? getBlockSubsidy(this.blockHeight + CTDLGAME.timePassed * 144 * 24 / 365) / 1000000
    this.item = options.item || items.find(item => item.chance >= Math.random())

    this.health = options.health ?? Math.round(this.blockHeight / 21000)
    this.maxHealth = options.maxHealth ?? Math.round(this.blockHeight / 21000)

    this.cooldown = options.cooldown || 0
    this.removeTimer = options.removeTimer
  }

  spriteId = 'blockchain'
  spriteData = blockchain
  w = 10
  h = 10

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  moveLeft = {
    condition: () => this.vx === 0 && this.vy === 0 && this.cooldown === 0,
    effect: () => {
      this.direction = 'left'
      this.isMoving = 'left'
      const hasMoved = !moveObject(this, { x: -this.walkingSpeed, y: -4 }, CTDLGAME.quadTree)

      if (hasMoved) {
        playSound('drop')
        this.status = 'move'
        this.cooldown = Math.round(Math.random() * 6) + 3
        return SUCCESS
      }

      return FAILURE
    }
  }
  moveRight = {
    condition: () => this.vx === 0 && this.vy === 0 && this.cooldown === 0,
    effect: () => {
      this.direction = 'right'
      this.isMoving = 'right'

      const hasMoved = !moveObject(this, { x: this.walkingSpeed , y: -4}, CTDLGAME.quadTree)
      if (hasMoved) {
        playSound('drop')
        this.status = 'move'
        this.cooldown = Math.round(Math.random() * 6) + 3
        return SUCCESS
      }

      return FAILURE
    }
  }

  attack = {
    condition: () => this.type === 'queue' && this.closestEnemy && intersects(this.getBoundingBox(), this.closestEnemy.getBoundingBox()),
    effect: () => {
      if (this.getCenter().x > this.closestEnemy.getCenter().x) {
        this.direction = 'left'
      } else {
        this.direction = 'right'
      }

      if (this.status === 'attack' && this.frame === 3) {
        return this.closestEnemy.hurt(1, this.direction === 'left' ? 'right' : 'left', this)
      }
      if (this.status === 'attack') return SUCCESS

      this.frame = 0
      this.status = 'attack'

      return SUCCESS
    }
  }

  isLeader = () => {
    if (this.sensedBlocks.length === 0) return SUCCESS
    const superiorBlock = this.sensedBlocks.filter(block => block.blockHeight > this.blockHeight)

    return superiorBlock.length === 0
  }
  getNextBlock = () => {
    const sortedFriends = this.sensedBlocks
      // keep only blocks that come after current block
      .filter(block => block.blockHeight > this.blockHeight)
      .sort((a, b) => a.blockHeight - b.blockHeight)

    return sortedFriends.shift()
  }

  draw = () => {
    if (!canDrawOn(this.context)) return
    if (!this.sprite && this.spriteId) this.sprite = CTDLGAME.assets[this.spriteId]
    let spriteData = this.spriteData[this.type]

    if (this.frame >= spriteData.length) {
      this.frame = 0
    }

    let data = spriteData[this.frame]
    this.w = data.w
    this.h = data.h

    constants[this.context].globalAlpha = data.opacity ?? 1
    if (this.protection > 0) {
      this.protection--
      constants[this.context].globalAlpha = this.protection % 2
    }

    let x = this.swims ? this.x + Math.round(Math.sin(CTDLGAME.frame / 16 + (this.strength || 1))) : this.x
    if (this.nextBlock) {
      constants[this.context].fillStyle = '#FFF'
      constants[this.context].globalAlpha = .1
      sharpLine(constants[this.context], this.getCenter().x, this.getCenter().y, this.nextBlock.getCenter().x, this.nextBlock.getCenter().y)
      constants[this.context].globalAlpha = 1
    }
    constants[this.context].drawImage(
      this.sprite,
      data.x, data.y, this.w, this.h,
      x, this.y, this.w, this.h
    )
    constants[this.context].globalAlpha = 1

    this.drawDmgs()
    this.drawHeals()
  }

  onHurt = () => playSound('clunk')

  onDie = () => {
    this.sensedBlocks
      .filter(block => block.nextBlock && block.nextBlock.id === this.id)
      .map(block => block.die())

    this.removeTimer = 64
    this.status = 'rekt'
    this.type = 'stale'
    addTextToQueue(`Invalid block got rekt,\nyou found ș${this.sats}`)
  }

  update = () => {
    if (CTDLGAME.lockCharacters) {
      this.draw()
      return
    }

    if (this.type === 'queued' && CTDLGAME.blockHeight > this.blockHeight) this.type = 'mined'
    this.enemy = this.type === 'queue'

    this.applyPhysics()

    this.sensedBlocks = sense(this, /blockchain/i)
    this.nextBlock = this.getNextBlock()

    if (this.type === 'mined' && this.nextBlock?.type === 'queued' && Math.random() < .02) {
      CTDLGAME.objects.push(new Blockchain(
        this.id + '-',
        {
          x: this.x,
          y: this.y,
          type: 'queued',
          blockHeight: this.blockHeight + 1
        }
      ))
    }
    if (this.type !== 'stale') {
      if (this.isLeader()) {
        this.sensedEnemies = senseCharacters(this)
        this.closestEnemy = getClosest(this, this.sensedEnemies)
      }
      this.bTree.step()
    }

    if (this.status === 'fall') this.status = 'idle'

    if (this.protection > 0) {
      this.protection--
    }
    if (this.cooldown > 0) {
      this.cooldown--
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
}

export default Blockchain
