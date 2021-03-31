import constants from '../constants'
import { CTDLGAME } from '../gameUtils'
import spriteData from '../sprites/chrisWhodl'
import NPC from './NPC'

class ChrisWhodl extends NPC {
  constructor(id, options) {
    super(id, options)
    this.spriteData = spriteData
    this.startX = options.startX || this.x + 3
    this.startY = options.startY || this.y + 6
    this.w = this.spriteData[this.direction][this.status][0].w
    this.h = this.spriteData[this.direction][this.status][0].h
    this.thingsToSayTouch = [['Chris Whodl:\ntbdtbdtbd']]
    this.thingsToSaySelect = [['Chris Whodl:\ntbdtbdtbd']]
  }

  direction = 'right'
  status = 'move'

  drawMic = () => {
    constants[this.context].drawImage(
      CTDLGAME.assets.citadelBeach,
      11 * 8, 4 * 8, 8, 3 * 8,
      this.startX, this.startY, 8, 3 * 8
    )
  }

  update = () => {
    const spriteData = this.spriteData[this.direction][this.status]

    if (this.frame >= spriteData.length) {
      this.frame = 0
    }

    let data = spriteData[this.frame]

    if (/sing|groove/.test(this.status)) {
      this.drawMic()
    }
    constants[this.context].drawImage(
      CTDLGAME.assets.chrisWhodl,
      data.x, data.y, data.w, data.h,
      this.x, this.y, this.w, this.h
    )
    

    this.frame++
  }

  applyGravity = false
}
export default ChrisWhodl