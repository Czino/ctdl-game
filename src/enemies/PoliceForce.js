import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE, RUNNING } from 'behaviortree'

import spritePoliceForce from '../sprites/spritePoliceForce'
import { CTDLGAME } from '../gameUtils'
import { intersects, getClosest } from '../geometryUtils'
import { write } from '../font'
import constants from '../constants'
import { playSound } from '../sounds'
import { senseCharacters } from './enemyUtils'
import Agent from '../Agent'

const items = [
  { id: 'pizza', chance: 0.05 },
  { id: 'taco', chance: 0.02 }
]

const touchesEnemy = new Task({
   // in biting distance
  run: agent => agent.closestEnemy && intersects(agent.getBoundingBox(), agent.closestEnemy.getBoundingBox()) ? SUCCESS : FAILURE
})
const moveToClosestEnemy = new Task({
  run: agent => agent.closestEnemy && agent.moveTo.condition({ other: agent.closestEnemy, distance: -1 }) ? agent.moveTo.effect({ other: agent.closestEnemy, distance: -1 }) : FAILURE
})
const throwFlashbang = new Task({
  run: agent => agent.closestEnemy && agent.throwFlashbang.condition() ? agent.throwFlashbang.effect() : FAILURE
})
const block = new Task({
  run: agent => agent.closestEnemy && agent.block.condition() ? agent.block.effect() : FAILURE
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
const tree = new Selector({
  nodes: [
    attackEnemy,
    block,
    throwFlashbang,
    goToEnemy,
    'moveRandom',
    'idle'
  ]
})

class PoliceForce extends Agent {
  constructor(id, options) {
    super(id, options)
    this.health = options.health ?? Math.round(Math.random() * 7 + 1)
    this.usd = options.usd ?? Math.round(Math.random() * 4 + 1)
    this.item = options.item || items.find(item => item.chance >= Math.random())
    this.senseRadius = Math.round(Math.random() * 50) + 30
    this.flashbangs = options.flashbangs || (Math.random() > .8 ? 1 : 0)
    this.hasShield = options.hasShield || (Math.random() > .8)
  }

  class = 'PoliceForce'
  enemy = true
  w = 16
  h = 30
  spriteData = spritePoliceForce
  kneels = false

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  attack = {
    condition: () => this.closestEnemy && intersects(this.getBoundingBox(), this.closestEnemy.getBoundingBox()),
    effect: () => {
      if (this.getCenter().x > this.closestEnemy.getCenter().x) {
        this.direction = 'left'
      } else {
        this.direction = 'right'
      }

      if (this.status === 'attack' && this.frame === 3) {
        return this.closestEnemy.hurt(3, this.direction === 'left' ? 'right' : 'left')
      }
      if (this.status === 'attack') return SUCCESS

      this.frame = 0
      this.status = 'attack'

      return SUCCESS
    }
  }

  throwFlashbang = {
    condition: () => this.closestEnemy && this.flashbangs > 0,
    effect: () => {
      if (this.getCenter().x > this.closestEnemy.getCenter().x) {
        this.direction = 'left'
      } else {
        this.direction = 'right'
      }

      if (this.status === 'throw' && this.frame === 3) {
        this.flashbangs--
        // TODO add flashbang logic
      }
      if (this.status === 'throw') return SUCCESS

      this.status = 'throw'
      this.frame = 0

      return SUCCESS
    }
  }

  block = {
    condition: () => this.hasShield && this.closestEnemy?.status === 'attack',
    effect: () => {
      if (this.getCenter().x > this.closestEnemy.getCenter().x) {
        this.direction = 'left'
      } else {
        this.direction = 'right'
      }
      this.status = 'block'

      return SUCCESS
    }
  }

  onHurt = () => playSound('policeForceHurt') // TODO add sound
  onDie = () => playSound('policeForceHurt')

  update = () => {
    const sprite = CTDLGAME.assets.policeForce

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

    if (Math.abs(this.vy) < 3 && !/fall|rekt|hurt|spawn/.test(this.status)) {
      this.sensedEnemies = senseCharacters(this)
      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.bTree.step()
    }
    let spriteData = this.spriteData[this.direction][this.status]

    this.frame++
    if (this.status === 'hurt' && this.frame === 3) {
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

export default PoliceForce
