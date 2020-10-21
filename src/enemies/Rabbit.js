import rabbit from '../sprites/rabbit'
import { CTDLGAME } from '../gameUtils'
import { moveObject, intersects, getClosest } from '../geometryUtils'
import { write } from '../font'
import { addTextToQueue } from '../textUtils'
import constants from '../constants'
import { playSound } from '../sounds'
import { senseCharacters } from './enemyUtils'
import Agent from '../Agent'

const sprites = {
  rabbit
}

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

  idle = {
    condition: () => this.status !== 'rekt',
    effect: () => {
      this.status = 'idle'
      return true
    }
  }
  turnEvil = {
    condition: () => this.status === 'turnEvil' || (!this.isEvil && this.canTurnEvil && Math.random() < this.turnEvilRate),
    effect: () => {
      this.status = 'turnEvil'
      return true
    }
  }
  moveLeft = {
    condition: () => !/turnEvil|jump|spawn|hurt|rekt/.test(this.status) && this.vy === 0,
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
    condition: () => !/turnEvil|jump|spawn|hurt|rekt/.test(this.status) && this.vy === 0,
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
    condition: () => !/turnEvil|spawn|hurt|rekt/.test(this.status) && this.vy === 0 && this.canJump(),
    effect: () => {
      this.status = 'jump'

      this.vx = this.direction === 'right' ? 3 : -3
      this.vy = -6

      return true
    }
  }
  attack = {
    condition: () => !/turnEvil|spawn|hurt|rekt|burning/.test(this.status) && this.vy === 0,
    effect: ({ enemy }) => {
      if (this.status === 'attack' && this.frame === 2) {
        this.frame = 0
        enemy.hurt(.5, this.direction === 'left' ? 'right' : 'left')
        return true
      }
      if (this.status === 'attack') return true
  
      this.status = 'attack'
      return true
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

  hurt = (dmg, direction) => {
    if (!this.isEvil || /turnEvil|spawn|hurt|rekt/.test(this.status)) return
    playSound('rabbitHurt')
    this.dmgs.push({y: -8, dmg})
    this.health = Math.max(this.health - dmg, 0)
    this.status = 'hurt'
    this.vx = direction === 'left' ? 2 : -2
    if (this.health <= 0) {
      this.health = 0
      this.die()
    }
  }

  die = () => {
    playSound('burn')
    addTextToQueue(`evil rabbit got rekt`)
    this.status = 'rekt'
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

    if (this.vx !== 0) {
      if (this.vx > 6) this.vx = 6
      if (this.vx < -6) this.vx = -6

      moveObject(this, { x: this.vx , y: 0 }, CTDLGAME.quadTree)
      if (this.vx < 0) this.vx += 1
      if (this.vx > 0) this.vx -= 1
    }
    if (this.vy !== 0 && this.inViewport) {
      if (this.vy > 6) this.vy = 6
      if (this.vy < -6) this.vy = -6
      const hasCollided = !moveObject(this, { x: 0 , y: this.vy }, CTDLGAME.quadTree)

      if (hasCollided) this.vy = 0
    }

    // AI logic
    let action = { id: 'idle' }

    if (this.turnEvil.condition()) {
      action.id = 'turnEvil'
    } else if (!/turnEvil|rekt|spawn/.test(this.status)) {
      const enemy = getClosest(this.getCenter(), senseCharacters(this))
      if (enemy) {
        if (this.isEvil) {
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
        } else if (!this.canTurnEvil) {
          if (this.getCenter().x < enemy.getCenter().x) {
            action.id = 'moveLeft'
          } else if (enemy.getCenter().x <= this.getCenter().x) {
            action.id = 'moveRight'
          }
        } else {
          if (Math.random() < .03) {
            action.id = 'moveLeft'
          } else if (Math.random() < .03) {
            action.id = 'moveRight'
          }
        }
      } else {
        if (Math.random() < .03) {
          action.id = 'moveLeft'
        } else if (Math.random() < .03) {
          action.id = 'moveRight'
        }
      }
    }
    if (this[action.id].condition(action.payload)) {
      action.success = this[action.id].effect(action.payload)
    }
    if (!action.success && this.idle.condition()) {
      this.idle.effect()
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