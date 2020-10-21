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

  idle = {
    condition: () => !/climb|spawn|hurt|rekt|burning/.test(this.status) && this.vy === 0,
    effect: () => {
      this.status = 'idle'
      return true
    }
  }
  moveLeft = {
    condition: () => !/climb|spawn|hurt|rekt|burning/.test(this.status) && this.vy === 0,
    effect: () => {
      this.kneels = false
      this.direction = 'left'
      const hasMoved =  moveObject(this, { x: -this.walkingSpeed, y: 0 }, CTDLGAME.quadTree)

      if (hasMoved) {
        this.status = 'move'
        return true
      } else if (this.climb.condition()) {
        return this.climb.effect()
      } else if (this.idle.condition()) {
        return this.idle.effect()
      }

      return false
    }
  }
  moveRight = {
    condition: () => !/climb|spawn|hurt|rekt|burning/.test(this.status) && this.vy === 0,
    effect: () => {
      this.kneels = false
      this.direction = 'right'

      const hasMoved = moveObject(this, { x: this.walkingSpeed , y: 0}, CTDLGAME.quadTree)
      if (hasMoved) {
        this.status = 'move'
        return true
      } else if (this.climb.condition()) {
        return this.climb.effect()
      } else if (this.idle.condition()) {
        return this.idle.effect()
      }

      return false
    }
  }
  climb = {
    condition: () => !/spawn|hurt|rekt|burning/.test(this.status) && this.vy === 0 && this.canClimb(),
    effect: () => {
      this.status = 'climb'
      if (this.frame !== 10) return true
      moveObject(this, { x: this.direction === 'left' ? -3 : 3 , y: -6}, CTDLGAME.quadTree)
      this.status = 'idle'
      return true
    }
  }
  attack = {
    condition: ({ enemy }) => {
      if (/spawn|hurt|rekt|burning/.test(this.status) || this.vy !== 0) return false

      if (!enemy || !intersects(this.getBoundingBox(), enemy.getBoundingBox())) return false // not in biting distance

      return true
    },
    effect: ({ enemy }) => {
      this.kneels = enemy.status === 'rekt'

      if (this.status === 'attack' && this.frame === 3) {
        return enemy.hurt(1, this.direction === 'left' ? 'right' : 'left')
      }
      if (this.status === 'attack') return true

      this.frame = 0
      this.status = 'attack'

      return true
    }
  }

  actions = {
    idle: this.idle,
    moveLeft: this.moveLeft,
    moveRight: this.moveRight,
    climb: this.climb,
    attack: this.attack,
    moveTo: this.moveTo
  }

  canClimb = () => {
    let climbTo = this.getBoundingBox()
    climbTo.y -= -6
    climbTo.w += this.direction === 'right' ? 3 : -3

    if (window.DRAWSENSORS) {
      constants.overlayContext.globalAlpha = .5
      constants.overlayContext.fillStyle = 'red'
      constants.overlayContext.fillRect(climbTo.x, climbTo.y, climbTo.w, climbTo.h)
      constants.overlayContext.globalAlpha = 1
    }

    let obstacles = CTDLGAME.quadTree.query(climbTo)
      .filter(obj => obj.isSolid && !obj.enemy)
      .filter(obj => intersects(obj, climbTo))

    return obstacles.length === 0
  }

  hurt = (dmg, direction) => {
    if (/spawn|hurt|rekt|burning/.test(this.status)) return

    playSound('shitcoinerHurt')
    this.dmgs.push({y: -8, dmg})
    this.health = Math.max(this.health - dmg, 0)
    this.status = 'hurt'
    this.vx = direction === 'left' ? 2 : -2
    if (this.health <= 0) {
      this.health = 0
      this.die()
    }
  }

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

    if (this.vx !== 0) {
      if (this.vx > 6) this.vx = 6
      if (this.vx < -6) this.vx = -6

      moveObject(this, { x: this.vx , y: 0 }, CTDLGAME.quadTree)
      if (this.vx < 0) this.vx += 1
      if (this.vx > 0) this.vx -= 1
    }
    if (this.status === 'climb') {
      this.vy = 0
      if (this.climb.condition()) this.climb()
    }

    if (this.vy !== 0 && this.inViewport) {
      if (this.vy > 12) this.vy = 12
      if (this.vy < -12) this.vy = -12
      const hasCollided = !moveObject(this, { x: 0 , y: this.vy }, CTDLGAME.quadTree)

      if (hasCollided) this.vy = 0
    }

    // AI logic
    if (!/rekt|hurt|burning|spawn/.test(this.status)) {
      let action = { id: 'idle' }
      const enemy = getClosest(this.getCenter(), senseCharacters(this))
      if (enemy) {
        if (intersects(this.getBoundingBox(), enemy.getBoundingBox())) { // biting distance
          if (this.getCenter().x > enemy.getCenter().x) {
            this.direction = 'left'
          } else {
            this.direction = 'right'
          }
          action.id = 'attack'
          action.payload = { enemy }
        } else {
          action.id = 'moveTo'
          action.payload = { other: enemy, distance: -1 }
        }
      }
      if (this.actions[action.id].condition(action.payload)) {
        action.success = this.actions[action.id].effect(action.payload)
      }
      if (!action.success && this.idle.condition()) {
        this.idle.effect()
      }
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
