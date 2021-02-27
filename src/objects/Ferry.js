import { CTDLGAME } from '../gameUtils'
import constants from '../constants'
import GameObject from '../GameObject'
import Ramp from '../Ramp'
import { Boundary } from '../geometryUtils/makeBoundary'
import { intersects } from '../geometryUtils'
import { playSound } from '../sounds'
import NPC from '../npcs/NPC'

let rampHeightMapLeft = []
for (var i = 11; i > 0; i--) {
  let row = []
  for (let j = 11; j > 0; j--) {
    row.push(i > j ? 0 : 1)
  }
  rampHeightMapLeft.push(row)
}
let rampHeightMapRight = rampHeightMapLeft.map(row => JSON.parse(JSON.stringify(row)).reverse())

class Ferry extends GameObject {
  constructor(id, options) {
    super(id, options)
    this.context = options.context || 'fgContext'
    this.deckPushed = false
    this.direction = options.direction || 'right'
    this.captain = new NPC(
      'nakadai_mon',
      {
        x: this.direction === 'right' ? this.x + 38 : this.x + 98,
        y: this.y + 36
      }
    )
    this.captain.toJSON = null // this NPC does not need to be stored in the DB

    this.back = new Boundary({
      id: 'back-ferry',
      x: this.direction === 'right' ? this.x + 15 : this.x + this.w + 131,
      y: this.y + 34,
      w: 3,
      h: 19
    })
    this.back.isSolid = this.vx !== 0

    this.ramp = new Ramp(
      'ramp-ferry',
        constants.bgContext, {
          x: this.direction === 'right' ? this.x + 110 : this.x + this.w + 39,
          y: this.y + 52 - 11,
          w: 11,
          h: 11,
          sprite: null,
          spriteData: null,
          heightMap: this.direction === 'right' ? rampHeightMapRight : rampHeightMapLeft,
          isSolid: true
        }
    )
    this.deck = new Boundary({
      id: 'deck-ferry',
      x: this.direction === 'right' ? this.x + 110 + 11 : this.x + this.w + 39 - 11,
      y: this.y + 52 - 11,
      w: 29,
      h: 11
    })
    this.handRail = new Boundary({
      id: 'handRail-ferry',
      x: this.direction === 'right' ? this.x + 110 + 11 + 26 : this.x + this.w + 39 - 11 - 26,
      y: this.y + 52 - 11 - 16,
      w: 3,
      h: 16
    })
  }

  w = 150
  h = 65
  isSolid = true

  draw = () => {
    constants[this.context].drawImage(
      CTDLGAME.assets.ferry,
      this.direction === 'right' ? 0 : this.w, 0, this.w, this.h,
      this.x, this.y, this.w, this.h
    )
  }

  drive = velocity => {
    this.vx = velocity ?? 1
    this.back.isSolid = true
    this.direction = velocity >= 0 ? 'right' : 'left'

    this.captain.x = velocity >= 0 ? this.x + 38 : this.x + 98
    this.back.x = velocity >= 0 ? this.x + 15 : this.x + 131
    this.ramp.x = velocity >= 0 ? this.x + 110 : this.x + 2 + 3 + 29
    this.ramp.heightMap = velocity >= 0 ? rampHeightMapRight : rampHeightMapLeft
    this.deck.x = velocity >= 0 ? this.x + 110 + 11 : this.x + 2 + 3
    this.handRail.x = velocity >= 0 ? this.x + 110 + 11 + 26 : this.x + 2
  }

  stop = () => {
    this.vx = 0
    this.back.isSolid = false
  }

  update = () => {
    if (!this.deckPushed) {
      CTDLGAME.objects.push(this.captain)
      CTDLGAME.objects.push(this.back)
      CTDLGAME.objects.push(this.ramp)
      CTDLGAME.objects.push(this.deck)
      CTDLGAME.objects.push(this.handRail)
      this.deckPushed = true
    }

    if (this.vx) {
      this.x += this.vx
      this.back.x += this.vx
      this.ramp.x += this.vx
      this.deck.x += this.vx
      this.handRail.x += this.vx
      CTDLGAME.objects
        .filter(obj => obj.applyGravity)
        .filter(obj => intersects(this.getBoundingBox('real'), obj.getBoundingBox()))
        .map(obj => {
          obj.x += this.vx
        })

      playSound('elevator')
    }

    this.draw()
  }

  getBoundingBox = type => type === 'whole'
    ? ({
      id: this.id,
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h
    })
    : type === 'real'
    ? ({
      id: this.id,
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h
    })
    : ({
      id: this.id,
      x: this.x,
      y: this.y + 52,
      w: this.w,
      h: this.h - 52
    })

  toJSON = this._toJSON
}

export default Ferry