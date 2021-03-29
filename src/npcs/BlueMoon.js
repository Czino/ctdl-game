import constants from '../constants'
import { CTDLGAME } from '../gameUtils'
import spriteData from '../sprites/blueMoon'
import NPC from './NPC'

class BlueMoon extends NPC {
  constructor(id, options) {
    super(id, options)
    this.spriteData = spriteData
    this.w = this.spriteData[this.direction][this.status][0].w
    this.h = this.spriteData[this.direction][this.status][0].h
    this.thingsToSayTouch = [['BlueMoon:\nBitcoin is music and dance.\nLet\'s dance!!!!']]
    this.thingsToSaySelect = [['BlueMoon:\nBitcoin is music and dance.\nLet\'s dance!!!!']]
  }

  direction = 'right'
  status = 'move'

  update = () => {
    const spriteData = this.spriteData[this.direction][this.status]

    if (this.frame >= spriteData.length) {
      this.frame = 0
    }

    let data = spriteData[this.frame]

    constants[this.context].drawImage(
      CTDLGAME.assets.blueMoon,
      data.x, data.y, data.w, data.h,
      this.x, this.y, this.w, this.h
    )

    this.frame++
  }

  applyGravity = false
}
export default BlueMoon