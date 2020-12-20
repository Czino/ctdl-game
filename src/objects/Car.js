import { CTDLGAME } from '../gameUtils'
import constants from '../constants'
import spriteData from '../sprites/cars'
import { random } from '../arrayUtils'

const types = [
  'beetleWhite',
  'beetleBlue',
  'beetleYellow',
  'ferrari',
  'familyRed',
  'familyBlue',
  'familyYellow'
]

class Car {
  constructor(id, options) {
    this.id = id
    this.x = options.x
    this.y = options.y
    this.vx = options.vx || 0
    this.type = options.type || random(types)
    this.context = options.context || 'fgContext'
    this.spriteData = spriteData[this.vx > 0 ? 'right' : 'left'][this.type]
    this.w = this.spriteData.w
    this.h = this.spriteData.h
  }

  class = 'Car'

  draw = () => {
    constants[this.context].drawImage(
      CTDLGAME.assets.cars,
      this.spriteData.x, this.spriteData.y, this.spriteData.w, this.spriteData.h,
      this.x, this.y - this.h, this.spriteData.w, this.spriteData.h
    )
  }

  update = () => {
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

export default Car