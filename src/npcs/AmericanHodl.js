import spriteData from '../sprites/americanHodl'
import NPC from './NPC'

class AmericanHodl extends NPC {
  constructor(id, options) {
    super(id, options)
    this.spriteData = spriteData
    this.spriteId = 'americanHodl'
    this.w = this.spriteData[this.direction][this.status][0].w
    this.h = this.spriteData[this.direction][this.status][0].h
    this.thingsToSaySelect = [['American Hodl 22:\nThey really have outdone\nthemselves with this\nfuneral.']]
  }

  direction = 'left'
  status = 'idle'

  update = () => {
    this.draw()

    this.frame++
  }

  applyGravity = false
}
export default AmericanHodl