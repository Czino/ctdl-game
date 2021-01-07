import { CTDLGAME } from '../gameUtils'
import constants from '../constants'
import spriteData from '../sprites/bull'
import { intersects } from '../geometryUtils'


class Bull {
  constructor(id, options) {
    this.id = id
    this.x = options.x
    this.y = options.y
    this.vx = options.vx || 3
    this.frame = 0
    this.status = 'run'
    this.context = options.context || 'bgContext'
    this.spriteData = spriteData.right
  }

  w = 47
  h = 25

  draw = () => {
    this.frame++
    let spriteData = this.spriteData[this.status][this.frame]
    if (!spriteData) {
      this.frame = 0
      spriteData = this.spriteData[this.status][this.frame]
    }
    constants[this.context].drawImage(
      CTDLGAME.assets.bull,
      spriteData.x, spriteData.y, spriteData.w, spriteData.h,
      this.x, this.y, spriteData.w, spriteData.h
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

  toJSON = () => {
    let json = Object.keys(this)
    .filter(key => /string|number|boolean/.test(typeof this[key]))
    .reduce((obj, key) => {
      obj[key] = this[key]
      return obj
    }, {})
    json.class = this.constructor.name
    return json
  }
}

export default Bull