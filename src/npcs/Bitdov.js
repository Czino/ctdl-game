import constants from '../constants'
import { CTDLGAME } from '../gameUtils'
import spriteData from '../sprites/bitdov'
import NPC from './NPC'

class Bitdov extends NPC {
  constructor(id, options) {
    super(id, options)
    this.spriteData = spriteData
    this.thingsToSayTouch = [['Bitdov:\nWaka waka, bitcoinheiros']]
    this.thingsToSaySelect = [['Bitdov:\nWaka waka, bitcoinheiros']]
  }

  direction = 'right'
  status = 'move'
  w = 32
  h = 48

  update = () => {
    const spriteData = this.spriteData[this.direction][this.status]

    if (this.frame >= spriteData.length) {
      this.frame = 0
    }

    let data = spriteData[this.frame]

    constants[this.context].drawImage(
      CTDLGAME.assets.bitdov,
      data.x, data.y, data.w, data.h,
      this.x, this.y, this.w, this.h
    )

    this.frame++
  }

  applyGravity = false
}
export default Bitdov