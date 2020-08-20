import hodlonaut from './sprites/hodlonaut'
import hodlonautSprite from './sprites/hodlonaut.png'
import katoshi from './sprites/katoshi'
import katoshiSprite from './sprites/katoshi.png'

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

export default function(name, context, pos) {
  this.id = name;
  this.sprite = null
  this.spriteData = sprites[name].data
  this.hasLoaded
  this.context = context
  this.w = 16
  this.h = 30
  this.x = pos.x
  this.y = pos.y - this.h
  this.status = 'idle'
  this.direction = 'right'
  this.frame = 0

  this.idle = () => {
    if (this.status === 'jump') return
    this.status = 'idle'
  }
  this.moveLeft = () => {
    if (this.status === 'jump') return
    this.status = 'move'
    this.direction = 'left'
    this.x -= 3
  }
  this.moveRight = () => {
    if (this.status === 'jump') return
    this.status = 'move'
    this.direction = 'right'
    this.x += 3
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
      this.x += this.direction === 'right' ? 2 : -2
      this.y -= 4
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