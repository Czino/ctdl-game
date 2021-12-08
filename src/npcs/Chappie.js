import constants from '../constants'
import { CTDLGAME } from '../gameUtils'
import spriteData from '../sprites/chappie'
import NPC from './NPC'

class Chappie extends NPC {
  constructor(id, options) {
    super(id, options)
    this.spriteData = spriteData
    this.thingsToSayTouch = [['Chappie:\nsparks, rays, colors, dancing, singing, Bitcoin']]
    this.thingsToSaySelect = [['Chappie:\nsparks, rays, colors, dancing, singing, Bitcoin']]
  }

  direction = 'left'
  status = 'move'
  w = 20
  h = 30

  update = () => {
    const spriteData = this.spriteData[this.direction][this.status]

    if (this.frame >= spriteData.length) {
      this.frame = 0
    }

    let data = spriteData[this.frame]

    constants[this.context].drawImage(
      CTDLGAME.assets.chappie,
      data.x, data.y, data.w, data.h,
      this.x, this.y, this.w, this.h
    )

    this.frame++
  }

  applyGravity = false
}
export default Chappie