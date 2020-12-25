import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

import spritePoliceForce from '../sprites/policeForce'
import spritePoliceForceWithShield from '../sprites/policeForceWithShield'
import { CTDLGAME } from '../gameUtils'
import { intersects, getClosest } from '../geometryUtils'
import { write } from '../font'
import constants from '../constants'
import { playSound } from '../sounds'
import { senseCharacters } from './enemyUtils'
import Agent from '../Agent'
import Flashbang from '../objects/Flashbang'
import { addTextToQueue } from '../textUtils'
import { unique } from '../arrayUtils'

const items = [
  { id: 'pizza', chance: 0.05 },
  { id: 'taco', chance: 0.02 }
]

const touchesEnemy = new Task({
  run: agent => agent.closestEnemy && intersects(agent.getBoundingBox(), agent.closestEnemy.getBoundingBox()) ? SUCCESS : FAILURE
})
const holdPositionOrder = new Task({
  run: () => CTDLGAME.world.map.state.protestScene ? SUCCESS : FAILURE
})
const hasShield = new Task({
  run: agent => agent.hasShield ? SUCCESS : FAILURE
})
const moveToClosestEnemy = new Task({
  run: agent => agent.closestEnemy && agent.moveTo.condition({ other: agent.closestEnemy, distance: -1 }) ? agent.moveTo.effect({ other: agent.closestEnemy, distance: -1 }) : FAILURE
})
const throwFlashbang = new Task({
  run: agent => agent.closestEnemy && agent.throwFlashbang.condition() ? agent.throwFlashbang.effect() : FAILURE
})

const push = new Task({
  run: agent => agent.closestEnemy && agent.push.condition() ? agent.push.effect() : FAILURE
})

// Sequence: runs each node until fail
const attackEnemy = new Sequence({
  nodes: [
    touchesEnemy,
    'attack'
  ]
})

// Sequence: runs each node until fail
const pushEnemy = new Sequence({
  nodes: [
    hasShield,
    touchesEnemy,
    push
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

const hostileBehaviour = new Sequence({
  nodes: [
    'seesEnemy',
    new Selector({
      nodes: [
        pushEnemy,
        attackEnemy,
        throwFlashbang,
        goToEnemy
      ]
    })
  ]
})

const tree = new Selector({
  nodes: [
    holdPositionOrder,
    hostileBehaviour,
    'moveRandom',
    'idle'
  ]
})

class PoliceForce extends Agent {
  constructor(id, options) {
    super(id, options)
    this.health = options.health ?? Math.round(Math.random() * 7 + 10)
    this.usd = options.usd ?? Math.round(Math.random() * 400 + 1)
    this.item = options.item || items.find(item => item.chance >= Math.random())
    this.senseRadius = Math.round(Math.random() * 50) + 30
    this.flashbangs = options.flashbangs ?? (Math.random() > .8 ? 1 : 0)
    this.enemy = options.enemy
    this.sensedCriminals = options.sensedCriminals || []
    this.hasShield = options.hasShield ?? (Math.random() > .8)
    this.spriteData = this.hasShield ? spritePoliceForceWithShield : spritePoliceForce
    this.protection = 0
  }

  class = 'PoliceForce'
  enemy = false
  w = 16
  h = 30

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  attack = {
    condition: () => this.closestEnemy && intersects(this.getBoundingBox(), this.closestEnemy.getBoundingBox()),
    effect: () => {
      if (!this.enemy) this.enemy = true
      if (this.getCenter().x > this.closestEnemy.getCenter().x) {
        this.direction = 'left'
      } else {
        this.direction = 'right'
      }

      if (this.status === 'attack' && this.frame === 3) {
        playSound('woosh')
        return this.closestEnemy.hurt(Math.round(Math.random() * 2) + 1, this.direction === 'left' ? 'right' : 'left', this)
      }
      if (this.status === 'attack') return SUCCESS

      this.frame = 0
      this.status = 'attack'

      return SUCCESS
    }
  }

  throwFlashbang = {
    condition: () => this.closestEnemy && this.flashbangs > 0 && Math.random() < .3,
    effect: () => {
      if (this.getCenter().x > this.closestEnemy.getCenter().x) {
        this.direction = 'left'
      } else {
        this.direction = 'right'
      }

      if (this.status === 'throw' && this.frame === 3) {
        this.flashbangs--
        CTDLGAME.objects.push(new Flashbang(
          'flashbang-' + CTDLGAME.frame,
            {
              x: this.getBoundingBox().x + 10,
              y: this.getBoundingBox().y,
              vx: this.direction === 'right' ? 10 : -10,
              vy: -6
            }
          ))
      }
      if (this.status === 'throw') return SUCCESS

      this.status = 'throw'
      this.frame = 0

      return SUCCESS
    }
  }

  push = {
    condition: () => this.hasShield && !/attack/.test(this.status) && this.closestEnemy && Math.random() > .8,
    effect: () => {
      this.closestEnemy.stun(this.getCenter().x > this.closestEnemy.getCenter().x ? 'right' : 'left')

      return SUCCESS
    }
  }

  hurtCondition = (dmg, direction) => this.hasShield && direction === this.direction
    ? !/hurt|rekt/.test(this.status) && this.protection === 0 && /attack/.test(this.status) && Math.random() > .5
    :  !/hurt|rekt/.test(this.status) && this.protection === 0

  onHurt = () => {
    playSound('policeForceHurt') // TODO add sound
  }
  onDie = () => {
    this.removeTimer = 64
    playSound('policeForceHurt')
    addTextToQueue(`Police Force got rekt,\nyou found $${this.usd}`)
  }

  update = () => {
    if (!this.sprite) this.sprite = CTDLGAME.assets[this.hasShield ? 'policeForceWithShield' : 'policeForce']
    this.isSolid = this.hasShield && CTDLGAME.world.map.state.protestScene

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

    if (Math.abs(this.vy) < 3 && !/fall|rekt|hurt|spawn/.test(this.status)) {
      const senseBox = {
        x: this.x - this.senseRadius,
        y: this.y - this.senseRadius,
        w: this.w + this.senseRadius * 2,
        h: this.h + this.senseRadius * 2
      }
      this.sensedObjects = CTDLGAME.quadTree
        .query(senseBox)
  
      this.sensedEnemies = senseCharacters(this)
      this.sensedFriends = this.sensedObjects
        .filter(obj => obj && obj.class === this.class && obj.status !== 'rekt')

      // check who is doing "criminal activity"
      this.sensedEnemies
        .filter(enemy => /attack/i.test(enemy.status))
        .filter(enemy => enemy.id !== this.id)
        .forEach(enemy => this.sensedCriminals.push(enemy.id))

      if (this.sensedCriminals.length > 0) {
        this.sensedCriminals = this.sensedCriminals
        this.sensedFriends.forEach(friend => {
          friend.sensedCriminals = friend.sensedCriminals.concat(this.sensedCriminals).filter(unique())
        })
      }

      this.sensedEnemies = this.sensedEnemies.filter(enemy => this.sensedCriminals.indexOf(enemy.id) !== -1)
      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.bTree.step()
    }

    if (this.status !== 'idle' || Math.random() < .05) {
      this.frame++
    }
    if (this.status === 'hurt' && this.protection === 0) {
      this.status = 'idle'
    }

    if (this.removeTimer) this.removeTimer--
    if (this.removeTimer === 0) this.remove = true

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
