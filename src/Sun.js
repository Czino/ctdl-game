import constants from './constants'
import { CTDLGAME, getTimeOfDay } from './gameUtils'
import { canDrawOn } from './performanceUtils'

export default function(options) {
  this.id = 'sun'
  this.class = 'Sun'
  this.w = 7
  this.h = 7
  this.x = options.x
  this.y = options.y
  this.isSolid = false

  this.easeInOut = (x, a) => Math.pow(x, a) / (Math.pow(x, a) + Math.pow(1 - x, a))
  this.drawSky = timeOfDay => {
    let y = timeOfDay < 4 || timeOfDay > 20 ? 0 : 1

    if (timeOfDay >= 4 && timeOfDay <= 6) {
      y = this.easeInOut((timeOfDay - 4) / 2, 3)
    } else if (timeOfDay >= 17 && timeOfDay <= 20) {
      y = this.easeInOut((timeOfDay - 20) / -3, 3)
    }

    let sky = {
      h: Math.max(245, Math.min(338, 338 - y * 93)),
      s: Math.max(11, Math.min(50, 50 - y * 39)),
      l: Math.min(78, Math.max(3, 3 + y * 75))
    }
    CTDLGAME.skyColor = sky

    constants.skyContext.fillStyle = `hsl(${sky.h}, ${sky.s}%, ${sky.l}%)`
    constants.skyContext.fillRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
  }
  this.update = () => {
    if (!canDrawOn('skyContext')) return

    let timeOfDay = getTimeOfDay()
    // first column, is day time, second is night time
    this.y = Math.round(CTDLGAME.viewport.y + 10)
    
    this.drawSky(timeOfDay)

    if (timeOfDay < 5 || timeOfDay > 19) return
    if (timeOfDay < 6) {
      this.y += (5 - timeOfDay + 1) * constants.HEIGHT
    }

    if (timeOfDay > 18) {
      this.y += (timeOfDay - 18) * constants.HEIGHT
    }

    let middle = CTDLGAME.viewport.x + constants.WIDTH / 2
    this.x = Math.round(middle - (CTDLGAME.viewport.x * 8 / CTDLGAME.world.w))
    let center = this.getCenter()

    constants.skyContext.fillStyle = '#FFF'
    constants.skyContext.beginPath()
    constants.skyContext.arc(center.x, center.y, this.w, 0, 2 * Math.PI)
    constants.skyContext.fill()
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