import constants from '../constants'
import { CTDLGAME } from '../gameUtils'
import spriteData from '../sprites/joseSBam'
import NPC from './NPC'

class JoseSBam extends NPC {
  constructor(id, options) {
    super(id, options)
    this.spriteData = spriteData
    this.w = this.spriteData[this.direction][this.status][0].w
    this.h = this.spriteData[this.direction][this.status][0].h
    this.thingsToSayTouch = [
      ['Jose S.hodl, PhD:\n...beware of scammers\npretending to be\n"official Bitcoin delegation"...'],
      ['Jose S.hodl, PhD:\n...LOL not what I was\nexpecting, but...'],
      ['Jose S.hodl, PhD:\n...what an ignorant\ndumbass...'],
      ['Jose S.hodl, PhD:\n...I\'m trying to be a realtor\nright now. Selling my own\nhouse. ahah!...'],
      ['Jose S.hodl, PhD:\n...THAT\'S WHY THE LIONS DON\'T WANT NOTHING WITH\nTHOSE FUCKERS!...'],
      ['Jose S.hodl, PhD:\n...No one is fucking with Greg after this pic. LOL...'],
    ]
    this.thingsToSaySelect = [
      ['Jose S.hodl, PhD:\nEnjoy your kids company and go for a walk in nature. Be strong. Stay strong.'],
      ['Jose S.hodl, PhD:\nBitcoin = Agua = Life'],
      ['Jose S.hodl, PhD:\nVanity is the ruin of\nKings and Men.'],
      ['Jose S.hodl, PhD:\nBitcoin will make wars unnaffordable. Bitcoin is the currency of peace.'],
    ]
  }

  direction = 'left'
  status = 'idle'

  update = () => {
    const spriteData = this.spriteData[this.direction][this.status]

    if (this.frame >= spriteData.length) {
      this.frame = 0
    }

    let data = spriteData[this.frame]

    constants.gameContext.drawImage(
      CTDLGAME.assets.joseSBam,
      data.x, data.y, data.w, data.h,
      this.x, this.y + Math.round(Math.sin(CTDLGAME.frame / 36)), this.w, this.h
    )

    this.frame++
  }

  applyGravity = false
}
export default JoseSBam