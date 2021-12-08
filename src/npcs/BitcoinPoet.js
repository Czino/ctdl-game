import constants from '../constants'
import { CTDLGAME } from '../gameUtils'
import spriteData from '../sprites/bitcoinPoet'
import { addTextToQueue } from '../textUtils'
import NPC from './NPC'

class BitcoinPoet extends NPC {
  constructor(id, options) {
    super(id, options)
    this.spriteData = spriteData
    this.w = this.spriteData[this.direction][this.status][0].w
    this.h = this.spriteData[this.direction][this.status][0].h
    this.thingsToSaySelect = [
      'The ₿itcoin Poet:\n@PoetBitcoin is my handle\nand I\'m here to play a game',
      'The ₿itcoin Poet:\nI\'m not a cat,\nbut I can ramble',
      'The ₿itcoin Poet:\netching words into\nyour brain',
      'The ₿itcoin Poet:\nThe #blockchain is\neternal life',
      'The ₿itcoin Poet:\na poets dream come true',
      'The ₿itcoin Poet:\nI sink my words into\nyour rhymes',
      'The ₿itcoin Poet:\nand smell the\nhashrate stew',
      'The ₿itcoin Poet:\nWith laser streaming\nthrough my eyes',
      'The ₿itcoin Poet:\nI walk the Hodler\'s path',
      'The ₿itcoin Poet:\nFor those who\'ve seen\nthrough the lies',
      'The ₿itcoin Poet:\nlife itself has done\nthe math'
    ]
  }

  direction = 'right'
  status = 'idle'

  update = () => {
    const spriteData = this.spriteData[this.direction][this.status]

    if (this.frame >= spriteData.length) {
      this.frame = 0
    }

    let data = spriteData[this.frame]

    constants.gameContext.drawImage(
      CTDLGAME.assets.bitcoinPoet,
      data.x, data.y, data.w, data.h,
      this.x, this.y, this.w, this.h
    )

    this.frame++
  }

  select = () => {
    if (!this.thingsToSaySelect || this.isSelected) return
    this.isSelected = true

    this.status = 'talk'

    this.thingsToSaySelect.map((text, index) => {
      if (index === this.thingsToSaySelect.length - 1) {
        addTextToQueue(text, () => {
          this.isSelected = false
          this.status = 'idle'
        })
      } else {
        addTextToQueue(text)
      }
    })
  }

  applyGravity = false
}
export default BitcoinPoet