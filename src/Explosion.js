import explosion from './sprites/explosion'
import { CTDLGAME } from './gameUtils'

class Explosion {
  constructor(context, options) {
    this.context = context
    this.x = options.x
    this.y = options.y
  }

  w = 48
  h = 48
  frame = 0

  getClass = () => this.constructor.name

  update = () => {
    if (this.remove) return

    const sprite = CTDLGAME.assets.explosion
    let data = explosion[this.frame]

    this.context.drawImage(
      sprite,
      data.x, data.y, this.w, this.h,
      this.x - this.w / 2, this.y - this.h / 2, this.w, this.h
    )

    this.frame++

    if (this.frame === explosion.length) {
      this.remove = true
    }
  }

  getBoundingBox = () => ({
    id: this.id,
    x: this.x,
    y: this.y,
    w: this.w,
    h: this.h
  })
}

export default Explosion