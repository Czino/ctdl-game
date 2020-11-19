import { CTDLGAME } from '../gameUtils'
import constants from '../constants'
import { intersects } from '../geometryUtils'

class Elevator {
  constructor(id, options) {
    this.id = id
    this.x = options.x
    this.y = options.y
    this.offsetY = options.offsetY || 0
    this.minOffset = options.minOffset || 0
    this.maxOffset = options.maxOffset || 0
    this.isSolid = true
  }

  class = 'Elevator'
  controls = {
    w: 'up',
    s: 'down',
    i: 'up',
    k: 'down'
  }
  spriteData = {
    x: 32,
    y: 56
  }
  bgData = {
    w: 8,
    h: 16,
    x: 56,
    y: 56
  }
  ropeData = {
    w: 8,
    h: 8,
    x: 32,
    y: 48
  }
  w = 24
  h = 32

  draw = () => {
    for (let x = 0; x < 3; x++) {
      constants.bgContext.drawImage(
        CTDLGAME.assets.dogeCoinMine,
        this.bgData.x, this.bgData.y, this.bgData.w, this.bgData.h,
        this.x + x * 8, this.y + this.offsetY, this.bgData.w, this.bgData.h
      )
    }
    constants.fgContext.drawImage(
      CTDLGAME.assets.dogeCoinMine,
      this.spriteData.x, this.spriteData.y, this.w, this.h,
      this.x, this.y + this.offsetY, this.w, this.h
    )
    for (let y = 8; y < this.offsetY + 8; y+= 8) {
      constants.bgContext.drawImage(
        CTDLGAME.assets.dogeCoinMine,
        this.ropeData.x, this.ropeData.y, this.ropeData.w, this.ropeData.h,
        this.x, this.y + this.offsetY - y, this.ropeData.w, this.ropeData.h
      )
      constants.bgContext.drawImage(
        CTDLGAME.assets.dogeCoinMine,
        this.ropeData.x, this.ropeData.y, this.ropeData.w, this.ropeData.h,
        this.x + 8 * 2, this.y + this.offsetY - y, this.ropeData.w, this.ropeData.h
      )
    }
  }

  update = () => {
    if (intersects(this.getBoundingBox('real'), window.SELECTEDCHARACTER.getBoundingBox())) {
      let move = 0
      this.senseControls()
      if (this.action === 'up' && this.offsetY > this.minOffset) {
        move = -3
      } else  if (this.action === 'down' && this.offsetY < this.maxOffset) {
        move = 3
      }
      this.offsetY += move

      if (intersects(this.getBoundingBox('real'), CTDLGAME.hodlonaut.getBoundingBox())) {
        CTDLGAME.hodlonaut.y += move
      }
      if (intersects(this.getBoundingBox('real'), CTDLGAME.katoshi.getBoundingBox())) {
        CTDLGAME.katoshi.y += move
      }
    }

    this.draw()
  }

  senseControls = () => {
    this.action = Object.keys(this.controls)
      .filter(key => window.KEYS.indexOf(key) !== -1)
      .map(key => this.controls[key])
      .pop() || this.action
  }

  getBoundingBox = type => type === 'real'
    ? ({
      id: this.id,
      x: this.x,
      y: this.y + this.offsetY,
      w: this.w,
      h: this.h
    })
    : ({
      id: this.id,
      x: this.x,
      y: this.y + this.offsetY + this.h - 2,
      w: this.w,
      h: 2
    })

  getAnchor = () => ({
      x: this.getBoundingBox().x + 2,
      y: this.getBoundingBox().y + this.getBoundingBox().h - 1,
      w: this.getBoundingBox().w - 5,
      h: 1
  })

  getCenter = () => ({
    x: Math.round(this.x + this.w / 2),
    y: Math.round(this.y + this.h / 2)
  })

  select = () => {}

  toJSON = () => Object.keys(this)
    .filter(key => /string|number|boolean/.test(typeof this[key]))
    .reduce((obj, key) => {
      obj[key] = this[key]
      return obj
    }, {})
}

export default Elevator