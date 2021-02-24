import { CTDLGAME } from '../gameUtils'
import constants from '../constants'
import GameObject from '../GameObject'
import Ramp from '../Ramp'
import { Boundary } from '../geometryUtils/makeBoundary'
import { intersects } from '../geometryUtils'
import { playSound } from '../sounds'

class Ferry extends GameObject {
  constructor(id, options) {
    super(id, options)
    this.offsetY = options.offsetY || 0
    this.context = options.context || 'fgContext'
    this.deckPushed = false
    this.back = new Boundary({
      id: 'back-ferry',
      x: this.x + 15,
      y: this.y + 34,
      w: 3,
      h: 19
    })
    this.back.isSolid = this.vx !== 0

    this.ramp = new Ramp(
      'ramp-ferry',
        constants.bgContext, {
          x: this.x + 110,
          y: this.y + 52 - 11,
          w: 11,
          h: 11,
          sprite: null,
          spriteData: null,
          heightMap: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          ],
          isSolid: true
        }
    )
    this.deck = new Boundary({
      id: 'deck-ferry',
      x: this.x + 110 + 11,
      y: this.y + 52 - 11,
      w: 29,
      h: 11
    })
    this.handRail = new Boundary({
      id: 'handRail-ferry',
      x: this.x + 110 + 11 + 26,
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
      0, 0, this.w, this.h,
      this.x, this.y, this.w, this.h
    )
  }

  drive = velocity => {
    this.vx = velocity || 1
    this.back.isSolid = true
  }

  stop = () => {
    this.vx = 0
    this.back.isSolid = false
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

  update = () => {
    if (!this.deckPushed) {
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

      playSound('elevator')
    }

    CTDLGAME.objects
      .filter(obj => obj.applyGravity)
      .filter(obj => intersects(this.getBoundingBox('real'), obj.getBoundingBox()))
      .map(obj => {
        obj.x += this.vx
      })
    this.draw()
  }

  toJSON = this._toJSON
}

export default Ferry