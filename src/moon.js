import constants from "./constants";
import { getTimeOfDay } from "./gameUtils";

export default function(context, options) {
  this.id = 'moon';
  this.class = 'Moon'
  this.context = context
  this.spriteData = { x: 0, y: 0, w: 109, h: 109 }
  this.w = 109
  this.h = 109
  this.x = options.x
  this.y = options.y
  this.isStatic = true
  this.isSolid = false

  this.update = () => {
    let timeOfDay = getTimeOfDay()
    let x = this.x
    this.y = Math.round(CTDLGAME.viewport.y + 10)
    this.w = this.h = Math.max(14, (1 - (window.CTDLGAME.viewport.y + constants.HEIGHT) / constants.WORLD.h) * 110)

    if (timeOfDay >= 6 && timeOfDay < 18) return
    if (timeOfDay > 18 && timeOfDay < 19) {
      this.y += (19 - timeOfDay) * constants.HEIGHT
    }
    if (timeOfDay > 5 && timeOfDay < 6) {
      this.y += (timeOfDay - 5) * constants.HEIGHT
    }


    let newMiddle = window.CTDLGAME.viewport.x + constants.WIDTH / 2
    this.x = Math.round(newMiddle - (window.CTDLGAME.viewport.x * 8 / constants.WORLD.w))
    let sprite = window.CTDLGAME.assets.moon
    this.context.drawImage(
      sprite,
      this.spriteData.x, this.spriteData.y, this.spriteData.w, this.spriteData.h,
      Math.round(x - this.w / 2), Math.round(this.y - this.h / 2), this.w, this.h
    )
  }
  this.getBoundingBox = () => this

  this.getCenter = () => ({
    x: this.x + this.w / 2,
    y: this.y + this.h / 2
  })

  this.toJSON = () => ({
    id: this.id,
    class: this.class,
    w: this.w,
    h: this.h,
    x: this.x,
    y: this.y,
    isStatic: this.isStatic,
    isSolid: this.isSolid
  })
}