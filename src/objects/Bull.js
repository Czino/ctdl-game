import { CTDLGAME } from '../gameUtils'
import constants from '../constants'
import spriteData from '../sprites/bull'
import { intersects } from '../geometryUtils'


class Bull {
  constructor(id, options) {
    this.id = id
    this.x = options.x
    this.y = options.y
    this.offsetY = options.offsetY || 0
    this.vx = options.vx || 3
    this.context = options.context || 'bgContext'
    this.spriteData = spriteData.right
    this.w = this.spriteData.w
    this.h = this.spriteData.h
  }

  class = 'Bull'

  draw = () => {
    constants[this.context].drawImage(
      CTDLGAME.assets.bull,
      this.spriteData.x, this.spriteData.y, this.spriteData.w, this.spriteData.h,
      this.x, this.y + this.offsetY, this.spriteData.w, this.spriteData.h
    )
  }

  update = () => {
    // out of frame out of mind
    if (Math.random() < 0.075 && !intersects(CTDLGAME.viewport, this.getBoundingBox())) {
      this.remove = true
    }

    this.x += this.vx

    if (this.x < -128 || this.x > CTDLGAME.world.w + 128) this.remove = true

    this.draw()
  }

  getBoundingBox = () => ({
    id: this.id,
    x: this.x,
    y: this.y,
    w: this.w,
    h: this.h
  })

  getAnchor = () => ({
      x: this.getBoundingBox().x,
      y: this.getBoundingBox().y + this.getBoundingBox().h - 1,
      w: this.getBoundingBox().w,
      h: 1
  })

  getCenter = () => ({
    x: Math.round(this.x + this.w / 2),
    y: Math.round(this.y + this.h / 2)
  })

  select = () => {}

  toJSON = () => Object.keys(this)
    .filter(key => /string|number|boolean/.test(typeof this[key]))
    .reduce((obj, key) => {
      obj[key] = this[key]
      return obj
    }, {})
}

export default Bull