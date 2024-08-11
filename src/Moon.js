import GameObject from './GameObject'
import constants from './constants'
import { CTDLGAME } from './gameUtils'

class Moon extends GameObject {
  constructor(options) {
    super('moon', options)
    this.spriteData = { x: 0, y: 0, w: 109, h: 109 }
    this.isSolid = false
  }

  w = 50
  h = 50

  update = () => {
    let sprite = CTDLGAME.assets.moon

    constants.menuContext.drawImage(
      sprite,
      this.spriteData.x, this.spriteData.y, this.spriteData.w, this.spriteData.h,
      Math.round(this.x - this.w / 2), Math.round(this.y - this.h / 2), this.w, this.h
    )
  }
}
export default Moon