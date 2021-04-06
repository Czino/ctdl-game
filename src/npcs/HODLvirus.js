import constants from '../constants'
import { CTDLGAME } from '../gameUtils'
import spriteData from '../sprites/hodlVirus'
import NPC from './NPC'

class HODLvirus extends NPC {
  constructor(id, options) {
    super(id, options)
    this.spriteData = spriteData
    this.w = this.spriteData[this.direction][this.status][0].w
    this.h = this.spriteData[this.direction][this.status][0].h
    this.thingsToSayTouch = [
      ['HODLvirus:\nTHE TRUTH IS VIRAL'],
      ['HODLvirus:\nPssst. You\'re infected.\nPass it on.']
    ]
    this.thingsToSaySelect = [['HODLvirus:\nThe path to maximalism is\npaved with the bones\nof shitcoins.']]
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
      CTDLGAME.assets.hodlVirus,
      data.x, data.y, data.w, data.h,
      this.x, this.y, this.w, this.h
    )

    this.frame++
  }

  applyGravity = false
}

export default HODLvirus