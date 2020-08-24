import hodlonaut from './sprites/hodlonaut'
import katoshi from './sprites/katoshi'
import { moveObject } from './geometryUtils'

const sprites = {
  hodlonaut,
  katoshi
}

export default function(id, context, quadTree, { selected, x, y }) {
  this.id = id;
  this.class = 'Character'
  this.spriteData = sprites[id]
  this.quadTree = quadTree
  this.selected = selected
  this.context = context
  this.w = 16
  this.h = 30
  this.x = x
  this.y = y
  this.vx = 0
  this.vy = 0
  this.status = 'idle'
  this.direction = 'right'
  this.frame = 0
  this.walkingSpeed = 3

  this.idle = () => {
    if (/jump|action/.test(this.status)) return
    this.status = 'idle'
  }
  this.moveLeft = () => {
    if (this.status === 'jump' || this.vy !== 0) return
    this.direction = 'left'
    const hasMoved =  moveObject(this, { x: -this.walkingSpeed, y: 0 }, this.quadTree)

    if (hasMoved) {
      this.status = 'move'
    }
  }
  this.moveRight = () => {
    if (this.status === 'jump' || this.vy !== 0) return
    this.direction = 'right'

    const hasMoved = moveObject(this, { x: this.walkingSpeed , y: 0}, this.quadTree)
    if (hasMoved) {
      this.status = 'move'
    }
  }
  this.jump = () => {
    if (this.status === 'jump' || this.vy !== 0) return
    this.status = 'jump'
    this.frame = 0
    this.vx = this.direction === 'right' ? 6 : -6
    this.vy = -6
  }
  this.back = () => {
    if (this.status === 'jump' || this.vy !== 0) return
    this.status = 'back'
  }
  this.action = () => {
    if (/jump|action/.test(this.status)) return
    this.frame = 0
    this.status = 'action'
  }

  this.senseControls = () => {
    if (this.id === 'hodlonaut') {
      if (KEYS.indexOf('e') !== -1) {
        this.jump()
      } else if (KEYS.indexOf('a') !== -1) {
        this.moveLeft()
      } else if (KEYS.indexOf('d') !== -1) {
        this.moveRight()
      } else if (KEYS.indexOf('w') !== -1) {
        this.back()
      } else {
        this.idle()
      }
    }
    if (this.id === 'katoshi') {
      if (KEYS.indexOf(' ') !== -1) {
        this.jump()
      } else if (KEYS.indexOf('arrowleft') !== -1) {
        this.moveLeft()
      } else if (KEYS.indexOf('arrowright') !== -1) {
        this.moveRight()
      } else if (KEYS.indexOf('arrowup') !== -1) {
        this.back()
      } else {
        this.idle()
      }
    }
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

    this.context.drawImage(
      sprite,
      data.x, data.y, this.w, this.h,
      this.x, this.y, this.w, this.h
    )

    if (this.selected) {
      this.context.fillStyle = '#0F0'
      this.context.fillRect(
        this.x + this.w / 2, this.y - 2, 1, 1
      )
    }
  }

  this.select = () => {
    this.selected = true
    window.SELECTED = this
  }
  this.unselect = () => {
    this.selected = false
    window.SELECTED = null
  }

  this.getBoundingBox = () => ({
    id: this.id,
    x: this.x + 5,
    y: this.y + 3,
    w: this.w - 10,
    h: this.h - 4
  })

  this.getCenter = () => ({
    x: this.x + this.w / 2,
    y: this.y + this.h / 2
  })
}