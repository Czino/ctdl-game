import spriteData from '../sprites/mrsAmericanHodl'
import NPC from './NPC'

class MrsAmericanHodl extends NPC {
  constructor(id, options) {
    super(id, options)
    this.spriteData = spriteData
    this.spriteId = 'mrsAmericanHodl'
    this.w = this.spriteData[this.direction][this.status][0].w
    this.h = this.spriteData[this.direction][this.status][0].h
    this.thingsToSaySelect = [['Mrs American Hodl:\n']]
  }

  direction = 'left'
  status = 'idle'

  update = () => {
    this.draw()

    this.frame++
  }

  applyGravity = false
}
export default MrsAmericanHodl