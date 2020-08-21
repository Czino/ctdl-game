import hodlonaut from './sprites/hodlonaut'
import hodlonautSprite from './sprites/hodlonaut.png'
import katoshi from './sprites/katoshi'
import katoshiSprite from './sprites/katoshi.png'
import { moveObject } from './geometryUtils'

const sprites = {
  hodlonaut: {
    img: hodlonautSprite,
    data: hodlonaut
  },
  katoshi: {
    img: katoshiSprite,
    data: katoshi
  }
}

export default function(id, context, quadTree, { x, y }) {
  this.id = id;
  this.sprite = null
  this.spriteData = sprites[id].data
  this.quadTree = quadTree
  this.hasLoaded
  this.context = context
  this.w = 16
  this.h = 30
  this.x = x
  this.y = y - this.h
  this.vx = 0
  this.vy = 0
  this.status = 'idle'
  this.direction = 'right'
  this.frame = 0
  this.walkingSpeed = 3

  this.idle = () => {
    if (this.status === 'jump') return
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
    if (this.status === 'jump') return
    this.status = 'action'
  }
  this.draw = () => {
    if (this.status !== 'idle' || Math.random() < .05) {
      this.frame++
    }

    if (this.vx !== 0) {
      if (this.vx > 6) this.vx = 6
      if (this.vx < -6) this.vx = -6

      moveObject(this, { x: this.vx , y: 0 }, this.quadTree)
      if (this.vx < 0) this.vx += 1
      if (this.vx > 0) this.vx -= 1
    }

    if (this.vy !== 0) {
      if (this.vy > 6) this.vy = 6
      if (this.vy < -6) this.vy = -6
      const hasCollided = !moveObject(this, { x: 0 , y: this.vy }, this.quadTree)

      if (hasCollided) this.vy = 0
    }

    if (this.frame >= this.spriteData[this.direction][this.status].length) {
      this.frame = 0
      if (this.status === 'jump') {
        this.status = 'idle'
      }
    }
    let data = this.spriteData[this.direction][this.status][this.frame]
    this.w = data.w
    this.h = data.h

    this.context.drawImage(
      this.sprite,
      data.x, data.y, this.w, this.h,
      this.x, this.y, this.w, this.h
    )
  }
  this.getBoundingBox = () => {
    return {
      x: this.x + 5,
      y: this.y,
      w: this.w - 10,
      h: this.h - 1
    }
  }
  this.load = () => {
    return new Promise(resolve => {
      const newImg = new Image;
      newImg.onload = () => {
        this.sprite = newImg
        resolve(this.sprite)
      }
      newImg.src = sprites[this.id].img;
    })
  }
}