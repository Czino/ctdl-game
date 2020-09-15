import { moveObject } from './geometryUtils';
import spriteData from './sprites/items'
import { playSound } from './sounds';


export default function(id, context, quadTree, options) {
  this.id = id;
  this.class = 'Item'
  this.spriteData = spriteData[this.id]

  this.quadTree = quadTree
  this.context = context
  this.w = this.spriteData.w
  this.h = this.spriteData.h
  this.x = options.x
  this.y = options.y
  this.vx = options.vx || 0
  this.vy = options.vy || 0

  const sprite = window.CTDLGAME.assets.items

  this.collect = () => {
    playSound('item')
    this.remove = true
    this.collected = true
  }
  this.update = () => {
    if (this.vx !== 0) {
      if (this.vx > 18) this.vx = 18
      if (this.vx < -18) this.vx = -18
      moveObject(this, { x: this.vx , y: 0 }, this.quadTree)
      if (this.vx < 0) this.vx += 1
      if (this.vx > 0) this.vx -= 1
    }

    if (this.vy !== 0) {
      if (this.vy > 6) this.vy = 6
      if (this.vy < -6) this.vy = -6
      const hasCollided = !moveObject(this, { x: 0 , y: this.vy }, this.quadTree)

      if (hasCollided) {
        this.vy = 0
      }
    }
    this.context.drawImage(
      sprite,
      this.spriteData.x, this.spriteData.y, this.spriteData.w, this.spriteData.h,
      this.x, this.y + Math.round(Math.sin(window.CTDLGAME.frame / 16)), this.w, this.h
    )
  }

  this.getBoundingBox = () => ({
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

  this.select = () => {}

  this.toJSON = () => ({
    id: this.id,
    class: this.class,
    w: this.w,
    h: this.h,
    x: this.x,
    y: this.y,
    vx: this.vx,
    vy: this.vy
  })
}