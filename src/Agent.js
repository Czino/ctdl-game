import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE, RUNNING } from '../node_modules/behaviortree/dist/index.node'
import Item from './Item'
import { CTDLGAME } from './gameUtils'
import { moveObject, intersects } from './geometryUtils'
import { addTextToQueue } from './textUtils'
import constants from './constants'
import { canDrawOn } from './performanceUtils'

BehaviorTree.register('seesEnemy', new Task({
  run: agent => agent.sensedEnemies.length > 0 ? SUCCESS : FAILURE
}))
BehaviorTree.register('touchesEnemy', new Task({
  run: agent => agent.attack.condition() ? SUCCESS : FAILURE
}))
BehaviorTree.register('doesNotTouchEnemy', new Task({
  run: agent => !agent.closestEnemy || !intersects(agent.getBoundingBox(), agent.closestEnemy.getBoundingBox()) ? SUCCESS : FAILURE
}))
BehaviorTree.register('idle', new Task({
  run: agent => agent.idle.condition() ? agent.idle.effect() : FAILURE
}))
BehaviorTree.register('moveLeft', new Task({
  run: agent => agent.moveLeft.condition() ? agent.moveLeft.effect() : FAILURE
}))
BehaviorTree.register('moveRight', new Task({
  run: agent => agent.moveRight.condition() ? agent.moveRight.effect() : FAILURE
}))
BehaviorTree.register('moveRandom', new Task({
  run: agent => {
    // if already moving, continue journey
    if (agent.isMoving === 'left' && Math.random() < .95) return agent.moveLeft.condition() ? agent.moveLeft.effect() : FAILURE
    if (agent.isMoving === 'right' && Math.random() < .95) return agent.moveRight.condition() ? agent.moveRight.effect() : FAILURE
    agent.isMoving = false
    return agent.moveRandom.condition() ? agent.moveRandom.effect() : FAILURE
  }
}))
BehaviorTree.register('moveToPointX', new Task({
  run: agent => {
    if (!agent.goal && Math.random() < .05) agent.goal = Math.round(Math.random() * CTDLGAME.world.w)
    if (agent.x % agent.goal < 5) agent.goal = null
    if (!agent.goal) return FAILURE
    if (agent.x < agent.goal) return agent.moveRight.condition() ? agent.moveRight.effect() : FAILURE
    if (agent.x > agent.goal) return agent.moveLeft.condition() ? agent.moveLeft.effect() : FAILURE
    return agent.moveRandom.condition() ? agent.moveRandom.effect() : FAILURE
  }
}))
BehaviorTree.register('jump', new Task({
  run: agent => agent.jump.condition() ? agent.jump.effect() : FAILURE
}))
BehaviorTree.register('attack', new Task({
  run: agent => agent.attack.condition() ? agent.attack.effect() : FAILURE
}))
BehaviorTree.register('moveTo', new Task({
  run: agent => agent.moveTo.condition() ? agent.moveTo.effect() : FAILURE
}))
BehaviorTree.register('hasLowHealth', new Task({
  run: agent => agent.health / agent.maxHealth < .2 ? SUCCESS : FAILURE
}))
BehaviorTree.register('runAwayFromClosestEnemy', new Task({
  run: agent => agent.closestEnemy && agent.runAwayFrom.condition({ other: agent.closestEnemy })
    ? agent.runAwayFrom.effect({ other: agent.closestEnemy })
    : FAILURE
}))
BehaviorTree.register('survive', new Sequence({
  nodes: [
    'hasLowHealth',
    'runAwayFromClosestEnemy'
 ]
}))

// Selector: runs until one node calls success
// Sequence: runs each node until fail
// Random: calls randomly, if running, will keep running
const tree = new Selector({
  nodes: [
    'moveRandom',
    'jump',
    'idle'
  ]
})

class Agent {
  constructor(id, options) {
    this.id = id
    this.health = options.health ?? 5
    this.usd = options.usd ?? 0
    this.w = 16
    this.h = 30
    this.x = options.x
    this.y = options.y
    this.vx = options.vx || 0
    this.vy = options.vy || 0
    this.status = options.status || 'idle'
    this.direction = options.direction || 'left'
    this.frame = options.frame || 0
    this.walkingSpeed = options.walkingSpeed || 2
    this.senseRadius = 30
    this.protection = 0
  }

  class = 'Agent'
  applyGravity = true
  dmgs = []
  heals = []

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
  moveLeft = {
    condition: () => true,
    effect: () => {
      this.direction = 'left'
      this.isMoving = 'left'
      const hasMoved =  !moveObject(this, { x: -this.walkingSpeed, y: 0 }, CTDLGAME.quadTree)

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
      this.isMoving = 'right'

      const hasMoved = !moveObject(this, { x: this.walkingSpeed , y: 0}, CTDLGAME.quadTree)
      if (hasMoved) {
        this.status = 'move'
        return SUCCESS
      }

      return FAILURE
    }
  }
  moveRandom = {
    condition: () => Math.random() < (this.activity || .01),
    effect: () => Math.random() < .5 ? this.moveLeft.effect() : this.moveRight.effect()
  }
  jump = {
    condition: () => this.canJump(),
    effect: () => {
      if (this.status !== 'jump') this.frame = 0
      this.status = 'jump'
      if (this.frame !== 1) return RUNNING
      this.vx = this.direction === 'right' ? 3 : -3
      this.vy = -6

      return SUCCESS
    }
  }
  attack = {
    condition: () => {
      if (!this.closestEnemy) return FAILURE

      if (!this.closestEnemy || !intersects(this.getBoundingBox(), this.closestEnemy.getBoundingBox())) return FAILURE // not in biting distance

      return SUCCESS
    },
    effect: () => {
      if (this.status === 'attack' && this.frame === 3) {
        this.closestEnemy.hurt(1, this.direction === 'left' ? 'right' : 'left', this)
        return SUCCESS
      }
      if (this.status === 'attack') return SUCCESS

      this.frame = 0
      this.status = 'attack'

      return SUCCESS
    }
  }
  moveTo = {
    condition: ({ other }) => other && Math.abs(other.getCenter().x - this.getCenter().x) <= this.senseRadius,
    effect: ({ other, distance }) => {
      let action = 'idle'

      if (this.getBoundingBox().x > other.getBoundingBox().x + other.getBoundingBox().w + distance) {
        action = 'moveLeft'
      } else if (other.getBoundingBox().x > this.getBoundingBox().x + this.getBoundingBox().w + distance) {
        action = 'moveRight'
      }
      if (this[action].condition()) return this[action].effect()
      return FAILURE
    }
  }
  lookAt = {
    condition: object => object,
    effect: object => {
      this.direction = this.getCenter().x > object.getCenter().x ? 'left' : 'right'
      return SUCCESS
    }
  }
  runAwayFrom = {
    condition: ({ other }) => other && Math.abs(other.getCenter().x - this.getCenter().x) <= this.senseRadius,
    effect: ({ other }) => {
      let action = 'idle'

      if (this.getBoundingBox().x > other.getBoundingBox().x) {
        action = this['runRight'] ? 'runRight' : 'moveRight'
      } else if (other.getBoundingBox().x > this.getBoundingBox().x) {
        action = this['runLeft'] ? 'runLeft' : 'moveLeft'
      }
      if (this[action].condition()) return this[action].effect()
      return FAILURE
    }
  }

  canJump = () => {
    if (this.hasShield) return false
    let jumpTo = this.getBoundingBox()
    jumpTo.y -= 6
    jumpTo.x += this.direction === 'right' ? 3 : -3

    if (window.DRAWSENSORS) {
      constants.overlayContext.fillStyle = 'red'
      constants.overlayContext.fillRect(jumpTo.x, jumpTo.y, jumpTo.w, jumpTo.h)
    }
    let obstacles = CTDLGAME.quadTree.query(jumpTo)
      .filter(obj => obj.isSolid && !obj.enemy && obj.class !== 'Ramp')
      .filter(obj => intersects(obj, jumpTo))

    return obstacles.length === 0
  }

  hurtCondition = (dmg, direction) => !/spawn|hurt|rekt|burning/.test(this.status) && !this.protection
  onHurt = () => {}
  onDie = () => {
    if (this.usd) {
      addTextToQueue(`${this.class} got rekt,\nyou found $${this.usd}`)
    } else {
      addTextToQueue(`${this.class} got rekt`)
    }
  }

  hurt = (dmg, direction) => {
    if (!this.hurtCondition(dmg, direction)) return

    this.dmgs.push({y: -8, dmg})
    this.health = Math.max(this.health - dmg, 0)
    this.status = 'hurt'
    this.vx = direction === 'left' ? 2 : -2
    this.protection = 4
    if (this.health <= 0) {
      this.health = 0
      return this.die()
    }

    return this.onHurt()
  }

  heal = heal => {
    if (/rekt/.test(this.status)) return
    this.heals.push({y: -8, heal})
    this.health = Math.min(this.health + heal, this.maxHealth)
  }

  die = () => {
    this.status = 'rekt'

    if (this.usd) CTDLGAME.inventory.usd += this.usd
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

    return this.onDie()
  }

  draw = () => {
    if (!canDrawOn('gameContext')) return

    let spriteData = this.spriteData[this.direction][this.status]

    if (this.frame >= spriteData.length) {
      this.frame = 0
    }

    let data = spriteData[this.frame]
    this.w = data.w
    this.h = data.h

    constants.gameContext.globalAlpha = data.opacity ?? 1
    if (this.protection > 0) {
      this.protection--
      constants.gameContext.globalAlpha = this.protection % 2
    }
    constants.gameContext.drawImage(
      this.sprite,
      data.x, data.y, this.w, this.h,
      this.x, this.y, this.w, this.h
    )
    constants.gameContext.globalAlpha = 1
  }

  applyPhysics = () => {
    if ((this.vx !== 0 || this.vy !== 0) && this.inViewport) {
      if (this.vx > 12) this.vx = 12
      if (this.vx < -12) this.vx = -12
      if (this.vy > 12) this.vy = 12
      if (this.vy < -12) this.vy = -12

      const hasCollided = moveObject(this, { x: this.vx , y: this.vy }, CTDLGAME.quadTree)

      if (!hasCollided && !/jump|rekt|hurt|burning/.test(this.status) && Math.abs(this.vy) > 5) {
        this.status = 'fall'
      }

      if (this.vx < 0) this.vx += 1
      if (this.vx > 0) this.vx -= 1
    }

    if (this.status === 'fall' && Math.abs(this.vy) <= 6) {
      this.status = 'idle'
    }
  }

  getBoundingBox = () => ({
    id: this.id,
    x: this.x,
    y: this.y,
    w: this.w,
    h: this.h
  })

  getAnchor = () => ({
      x: this.getBoundingBox().x + 2,
      y: this.getBoundingBox().y + this.getBoundingBox().h - 1,
      w: this.getBoundingBox().w - 5,
      h: 1
  })

  getCenter = () => ({
    x: Math.round(this.x + this.w / 2),
    y: Math.round(this.y + this.h / 2)
  })

  select = () => {}

  toJSON = () => Object.keys(this)
    .filter(key => /string|number|boolean/.test(typeof this[key]))
    .reduce((obj, key) => {
      obj[key] = this[key]
      return obj
    }, {})
}

export default Agent