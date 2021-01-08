import { CTDLGAME } from '../gameUtils'
import constants from '../constants'
import spriteData from '../sprites/cars'
import { random } from '../arrayUtils'
import { intersects } from '../geometryUtils'
import GameObject from '../GameObject'

const types = [
  'beetleWhite',
  'beetleBlue',
  'beetleYellow',
  'ferrari',
  'familyRed',
  'familyBlue',
  'familyYellow'
]

class Car extends GameObject {
  constructor(id, options) {
    super(id, options)
    this.offsetY = options.offsetY || 0
    this.type = options.type || random(types)
    this.context = options.context || 'fgContext'
    this.spriteData = spriteData[this.vx > 0 ? 'right' : 'left'][this.type]
    this.w = this.spriteData.w
    this.h = this.spriteData.h
  }

  draw = () => {
    constants[this.context].drawImage(
      CTDLGAME.assets.cars,
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

  toJSON = this._toJSON
}

export default Car