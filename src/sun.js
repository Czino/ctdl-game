import constants from "./constants";
import { CTDLGAME, getTimeOfDay } from "./gameUtils";

export default function(options) {
  this.id = 'sun';
  this.class = 'Sun'
  this.w = 7
  this.h = 7
  this.x = options.x
  this.y = options.y
  this.isSolid = false

  this.update = () => {
    let timeOfDay = getTimeOfDay()
    this.y = Math.round(CTDLGAME.viewport.y + 10)

    if (timeOfDay < 5 || timeOfDay > 19) return
    if (timeOfDay < 6) {
      this.y += (5 - timeOfDay + 1) * constants.HEIGHT
    }

    if (timeOfDay > 18) {
      this.y += (timeOfDay - 18) * constants.HEIGHT
    }

    let middle = CTDLGAME.viewport.x + constants.WIDTH / 2
    this.x = Math.round(middle - (CTDLGAME.viewport.x * 8 / constants.WORLD.w))
    let center = this.getCenter()

    constants.skyContext.fillStyle = '#FFF'
    constants.skyContext.beginPath();
    constants.skyContext.arc(center.x, center.y, this.w, 0, 2 * Math.PI);
    constants.skyContext.fill();
  }
  this.getBoundingBox = () => this

  this.getCenter = () => ({
    x: this.x,
    y: this.y
  })

  this.toJSON = () => ({
    id: this.id,
    class: this.class,
    w: this.w,
    h: this.h,
    x: this.x,
    y: this.y,
    isSolid: this.isSolid
  })
}