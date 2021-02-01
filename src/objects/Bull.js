import { CTDLGAME } from '../gameUtils'
import constants from '../constants'
import spriteData from '../sprites/bull'
import { intersects } from '../geometryUtils'
import GameObject from '../GameObject'

class Bull extends GameObject {
  constructor(id, options) {
    super(id, options)
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

  toJSON = this._toJSON
}

export default Bull