import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

import goldbugs from '../sprites/goldbugs'
import { CTDLGAME } from '../gameUtils'
import { moveObject, intersects, getClosest } from '../geometryUtils'
import { write } from '../font'
import constants from '../constants'
import { playSound } from '../sounds'
import { senseCharacters } from './enemyUtils'
import Agent from '../Agent'

const sprites = {
  goldbugs
}
const items = []

const touchesEnemy = new Task({
   // in biting distance
  run: agent => agent.closestEnemy && intersects(agent.getBoundingBox(), agent.closestEnemy.getBoundingBox()) ? SUCCESS : FAILURE
})
const moveToClosestEnemy = new Task({
  run: agent => agent.closestEnemy && agent.moveTo.condition({ other: agent.closestEnemy, distance: -5 }) ? agent.moveTo.effect({ other: agent.closestEnemy, distance: -5 }) : FAILURE
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

class Goldbugs extends Agent {
  constructor(id, options) {
    super(id, options)
    this.health = options.health ?? Math.round(Math.random() * 2 + 1)
    this.usd = options.usd ?? Math.round(Math.random() * 4 + 1)
    this.item = options.item || items.find(item => item.chance >= Math.random())
    this.senseRadius = Math.round(Math.random() * 30) + 10
  }

  class = 'Goldbugs'
  enemy = true
  w = 10
  h = 10
  spriteData = sprites.goldbugs

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

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

  onHurt = () => playSound('goldbugsHurt')

  update = () => {
    const sprite = CTDLGAME.assets.goldbugs

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

    if (!/rekt|hurt|spawn/.test(this.status) && this.vy === 0) {
      this.sensedEnemies = senseCharacters(this)
      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.bTree.step()
    }

    if (this.status === 'fall') this.status = 'idle'
    let spriteData = this.spriteData[this.direction][this.status]

    this.frame++
    if (this.status === 'hurt' && this.frame === 3) {
      this.status = 'idle'
    }
    if (this.status === 'rekt' && this.frame === 5) {
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

  getBoundingBox = () => ({
    id: this.id,
    x: this.x + 4,
    y: this.y,
    w: 2,
    h: this.h + 10
  })

  getAnchor = () => ({
    x: this.getBoundingBox().x,
    y: this.getBoundingBox().y + this.getBoundingBox().h,
    w: this.getBoundingBox().w,
    h: 1
  })
}

export default Goldbugs
