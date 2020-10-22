import Item from './Item'
import { CTDLGAME } from './gameUtils'
import { moveObject, intersects } from './geometryUtils'
import { addTextToQueue } from './textUtils'
import constants from './constants'

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
  }

  class = 'Agent'
  applyGravity = true
  dmgs = []
  heals = []

  idle = {
    condition: () => !/jump|spawn|hurt|rekt/.test(this.status),
    effect: () => {
      this.status = 'idle'
      return true
    }
  }
  moveLeft = {
    condition: () => !/jump|spawn|hurt|rekt/.test(this.status) && this.vy === 0,
    effect: () => {
      this.direction = 'left'
      const hasMoved =  moveObject(this, { x: -this.walkingSpeed, y: 0 }, CTDLGAME.quadTree)

      if (hasMoved) {
        this.status = 'move'
        return true
      } else if (this.jump.condition()) {
        return this.jump.effect()
      } else if (this.idle.condition()) {
        return this.idle.effect()
      }

      return false
    }
  }
  moveRight = {
    condition: () => !/jump|spawn|hurt|rekt/.test(this.status) && this.vy === 0,
    effect: () => {
      this.direction = 'right'

      const hasMoved = moveObject(this, { x: this.walkingSpeed , y: 0}, CTDLGAME.quadTree)
      if (hasMoved) {
        this.status = 'move'
        return true
      } else if (this.jump.condition()) {
        return this.jump.effect()
      } else if (this.idle.condition()) {
        return this.idle.effect()
      }

      return false
    }
  }
  jump = {
    condition: () => !/spawn|hurt|rekt/.test(this.status) && this.vy === 0 && this.canJump(),
    effect: () => {
      this.status = 'jump'

      this.vx = this.direction === 'right' ? 3 : -3
      this.vy = -6

      return true
    }
  }
  attack = {
    condition: ({ enemy }) => {
      if (/spawn|hurt|rekt/.test(this.status) || this.vy !== 0) return false

      if (!enemy || !intersects(this.getBoundingBox(), enemy.getBoundingBox())) return false // not in biting distance

      return true
    },
    effect: ({ enemy }) => {

      if (this.status === 'attack' && this.frame === 3) {
        return enemy.hurt(1, this.direction === 'left' ? 'right' : 'left')
      }
      if (this.status === 'attack') return true

      this.frame = 0
      this.status = 'attack'

      return true
    }
  }
  moveTo = {
    condition: ({ other }) => !/jump|spawn|hurt|rekt|burning/.test(this.status) && this.vy === 0 && Math.abs(other.getCenter().x - this.getCenter().x) <= this.senseRadius,
    effect: ({ other, distance }) => {
      let action = 'idle'

      if (this.getBoundingBox().x > other.getBoundingBox().x + other.getBoundingBox().w + distance) {
        action = 'moveLeft'
      } else if (other.getBoundingBox().x > this.getBoundingBox().x + this.getBoundingBox().w + distance) {
        action = 'moveRight'
      }
      if (this[action].condition()) return this[action].effect()
      return false
    }
  }

  actions = {
    idle: this.idle,
    moveLeft: this.moveLeft,
    moveRight: this.moveRight,
    jump: this.jump,
    attack: this.attack,
    moveTo: this.moveTo
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

  hurtCondition = () => {}
  onHurt = () => {}
  onDie = () => {
    if (this.usd) {
      addTextToQueue(`${this.class} got rekt,\nyou found $${this.usd}`)
    } else {
      addTextToQueue(`${this.class} got rekt`)
    }
  }

  hurt = (dmg, direction) => {
    if (/spawn|hurt|rekt/.test(this.status)) return
    if (!this.hurtCondition()) return

    this.dmgs.push({y: -8, dmg})
    this.health = Math.max(this.health - dmg, 0)
    this.status = 'hurt'
    this.vx = direction === 'left' ? 2 : -2
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

  onHurt = () => {}
  onDie = () => {}

  hurt = (dmg, direction) => {
    if (/spawn|hurt|rekt|burning/.test(this.status)) return

    this.dmgs.push({y: -8, dmg})
    this.health = Math.max(this.health - dmg, 0)
    this.status = 'hurt'
    this.vx = direction === 'left' ? 2 : -2
    if (this.health <= 0) {
      this.health = 0
      return this.die()
    }
    return this.onHurt()
  }

  applyPhysics = () => {
    if (this.vx !== 0) {
      if (this.vx > 12) this.vx = 12
      if (this.vx < -12) this.vx = -12

      moveObject(this, { x: this.vx , y: 0 }, CTDLGAME.quadTree)
      if (this.vx < 0) this.vx += 1
      if (this.vx > 0) this.vx -= 1
    }

    if (this.vy !== 0 && this.inViewport) {
      if (this.vy > 12) this.vy = 12
      if (this.vy < -12) this.vy = -12
      const hasCollided = !moveObject(this, { x: 0 , y: this.vy }, CTDLGAME.quadTree)

      if (hasCollided) {
        this.vy = 0
      } else if (!/jump|rekt|hurt|burning/.test(this.status) && Math.abs(this.vy) > 4) {
        this.status = 'fall'
      }
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