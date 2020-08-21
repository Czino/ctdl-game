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
  this.status = 'idle'
  this.direction = 'right'
  this.frame = 0
  this.walkingSpeed = 3

  this.idle = () => {
    if (this.status === 'jump') return
    this.status = 'idle'
  }
  this.moveLeft = () => {
    if (this.status === 'jump') return
    this.direction = 'left'
    const hasMoved =  moveObject(this, { x: -this.walkingSpeed, y: 0 }, this.quadTree)

    if (hasMoved) {
      this.status = 'move'
    }
  }
  this.moveRight = () => {
    if (this.status === 'jump') return
    this.direction = 'right'

    const hasMoved = moveObject(this, { x: this.walkingSpeed , y: 0}, this.quadTree)
    if (hasMoved) {
      this.status = 'move'
    }
  }
  this.jump = () => {
    if (this.status === 'jump') return
    this.frame = 0
    this.status = 'jump'
  }
  this.back = () => {
    if (this.status === 'jump') return
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
    if (this.status === 'jump') {
      const moveX = this.direction === 'right' ? 2 : -2
      this.y -= 4
      moveObject(this, { x: moveX , y: 0}, this.quadTree)
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
      h: this.h
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