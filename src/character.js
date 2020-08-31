import hodlonaut from './sprites/hodlonaut'
import katoshi from './sprites/katoshi'
import { moveObject, intersects } from './geometryUtils'
import { write } from './font';
import constants from './constants'

const sprites = {
  hodlonaut,
  katoshi
}

export default function(id, context, quadTree, options) {
  this.id = id;
  this.class = 'Character'
  this.spriteData = sprites[id]
  this.quadTree = quadTree
  this.context = context
  this.health = options.hasOwnProperty('health') ? options.health : 21
  this.dmgs = []
  this.heals = []
  this.selected = options.selected
  this.w = 16
  this.h = 30
  this.x = options.x
  this.y = options.y
  this.vx = options.vx || 0
  this.vy = options.vy || 0
  this.strength = id === 'hodlonaut' ? 1 : 3
  this.attackRange = id === 'hodlonaut' ? 1 : 5
  this.status = options.status || 'idle'
  this.direction = options.direction || 'right'
  this.frame = options.frame || 0
  this.walkingSpeed = options.walkingSpeed || 3

  this.idle = () => {
    if (/jump|action|hurt|rekt/.test(this.status)) return
    this.status = 'idle'
  }
  this.moveLeft = () => {
    if (/jump|action|hurt|rekt/.test(this.status)|| this.vy !== 0) return
    this.direction = 'left'
    const hasMoved =  moveObject(this, { x: -this.walkingSpeed, y: 0 }, this.quadTree)

    if (hasMoved) {
      this.status = 'move'
    }
  }
  this.moveRight = () => {
    if (/jump|action|hurt|rekt/.test(this.status) || this.vy !== 0) return
    this.direction = 'right'

    const hasMoved = moveObject(this, { x: this.walkingSpeed , y: 0}, this.quadTree)
    if (hasMoved) {
      this.status = 'move'
    }
  }
  this.jump = () => {
    if (/jump|action|hurt|rekt/.test(this.status) || this.vy !== 0) return
    this.status = 'jump'
    this.frame = 0
    this.vx = this.direction === 'right' ? 6 : -6
    this.vy = -6
  }
  this.back = () => {
    if (/jump|action|hurt|rekt/.test(this.status) || this.vy !== 0) return
    this.status = 'back'
  }
  this.action = () => {
    if (/jump|action|hurt|rekt/.test(this.status)) return
    this.frame = 0
    this.status = 'action'
  }
  this.attack = () => {
    if (/jump|action|hurt|rekt/.test(this.status)) return
    if (this.status !== 'attack') this.frame = 0
    this.status = 'attack'

    if (this.id === 'katoshi' && this.frame !== 3) return
    const enemies = this.senseEnemy()
    enemies.forEach((enemy, index) => {
      if (index > 2) return // can only hurt 3 enemies at once
      if (this.getCenter().x > enemy.getCenter().x) {
        this.direction = 'left'
      } else {
        this.direction = 'right'
      }
      enemy.hurt(this.strength, this.direction === 'left' ? 'right' : 'left')
    })
  }

  this.senseEnemy = () => {
    const boundingBox = this.getBoundingBox()
    return this.quadTree.query({
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h
    })
      .filter(enemy => enemy.enemy)
      .filter(enemy => intersects({
        x: this.direction === 'left' ? boundingBox.x - this.attackRange : boundingBox.x + boundingBox.w,
        y: boundingBox.y,
        w: this.attackRange,
        h: boundingBox.h
      }, enemy.getBoundingBox()))
  }


  this.hurt = (dmg, direction) => {
    if (/hurt|rekt/.test(this.status)) return
    this.dmgs.push({y: -8, dmg})
    this.health = Math.max(this.health - dmg, 0)
    this.status = 'hurt'
    this.vx = direction === 'left' ? 6 : -6
    this.vy = -3
    if (this.health <= 0) {
      this.health = 0
      this.die() // :(
    }
  }
  this.die = () => {
    this.status = 'rekt'
    this.unselect()
  }

  this.senseControls = () => {
    let didAction = KEYS.find(key => {
      if (!this[constants.CONTROLS[this.id][key]]) return false

      this[constants.CONTROLS[this.id][key]]()
      return true
    })

    if (!didAction) this.idle()
  }

  this.update = () => {
    const sprite = window.CTDLGAME.assets[this.id]
    if (this.vx !== 0) {
      if (this.vx > 6) this.vx = 6
      if (this.vx < -6) this.vx = -6

      moveObject(this, { x: this.vx , y: 0 }, this.quadTree)
      if (this.vx < 0) this.vx += 1
      if (this.vx > 0) this.vx -= 1
    }

    if (this.vy !== 0) {
      if (this.vy > 12) this.vy = 12
      if (this.vy < -12) this.vy = -12
      const hasCollided = !moveObject(this, { x: 0 , y: this.vy }, this.quadTree)

      if (hasCollided) this.vy = 0
    }

    if (this.status === 'hurt' && this.vx === 0 && this.vy === 0) {
      this.status = 'idle'
    }

    this.senseControls()

    if (this.status !== 'idle' || Math.random() < .05) {
      this.frame++
    }

    if (this.frame >= this.spriteData[this.direction][this.status].length) {
      this.frame = 0
      if (/jump|action/.test(this.status)) this.status = 'idle'
    }

    let data = this.spriteData[this.direction][this.status][this.frame]
    this.w = data.w
    this.h = data.h
    this.context.globalAlpha = data.hasOwnProperty('opacity') ? data.opacity : 1

    this.context.drawImage(
      sprite,
      data.x, data.y, this.w, this.h,
      this.x, this.y, this.w, this.h
    )

    this.context.globalAlpha = 1

    if (this.selected) {
      this.context.fillStyle = '#0F0'
      this.context.fillRect(
        this.x + this.w / 2, this.y - 2, 1, 1
      )
    }

    this.dmgs = this.dmgs
      .filter(dmg => dmg.y > -24)
      .map(dmg => {
        write(this.context, `-${dmg.dmg}`, {
          x: this.getCenter().x - 2,
          y: this.y + dmg.y,
          w: this.getBoundingBox().w
        }, 'left', false, 4, true, '#F00')
        return {
          ...dmg,
          y: dmg.y - 1
        }
      })
    this.heals = this.heals
      .filter(heal => heal.y > -24)
      .map(heal => {
        write(this.context, `-${heal.heal}`, {
          x: this.getCenter().x - 2,
          y: this.y + heal.y,
          w: this.getBoundingBox().w
        }, 'left', false, 4, true, '#0F0')
        return {
          ...heal,
          y: heal.y - 1
        }
      })
  }

  this.select = () => {
    if (this.status === 'rekt') return
    this.selected = true
    window.SELECTED = this
  }
  this.unselect = () => {
    this.selected = false
    window.SELECTED = null
  }

  this.getBoundingBox = () => this.status !== 'rekt'
  ? ({
      id: this.id,
      x: this.x + 5,
      y: this.y + 3,
      w: this.w - 10,
      h: this.h - 4
    })
  : ({
      id: this.id,
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h
    })

  this.getCenter = () => ({
    x: this.x + this.w / 2,
    y: this.y + this.h / 2
  })

  this.toJSON = () => ({
    id: this.id,
    class: this.class,
    health: this.health,
    selected: this.selected,
    w: this.w,
    h: this.h,
    x: this.x,
    y: this.y,
    vx: this.vx,
    vy: this.vy,
    status: this.status,
    direction: this.direction,
    frame: this.frame,
    walkingSpeed: this.walkingSpeed
  })
}