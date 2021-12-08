import { CTDLGAME } from '../gameUtils'
import constants from '../constants'
import GameObject from '../GameObject'

class FishingBoat extends GameObject {
  constructor(id, options) {
    super(id, options)
    this.context = options.context || 'fgContext'
  }

  w = 121
  h = 65

  draw = () => {
    constants[this.context].drawImage(
      CTDLGAME.assets.fishingBoat,
      0, 0, this.w, this.h,
      this.x + Math.round(Math.sin(CTDLGAME.frame / 32) * 2), this.y + Math.round(Math.cos(CTDLGAME.frame / 42)), this.w, this.h
    )
  }

  drive = velocity => {
    this.vx = velocity || 1
  }

  stop = () => {
    this.vx = 0
  }

  getBoundingBox = () => ({
    id: this.id,
    x: this.x,
    y: this.y,
    w: this.w,
    h: this.h
  })

  update = () => {
    this.draw()
  }

  toJSON = this._toJSON
}

export default FishingBoat