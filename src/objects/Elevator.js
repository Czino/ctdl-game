import { CTDLGAME } from '../gameUtils'
import constants from '../constants'
import { intersects, moveObject } from '../geometryUtils'
import { playSound } from '../sounds'

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
    k: 'down',
    escape: 'stop'
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
  buttonData = {
    up: {
      w: 8,
      h: 8,
      x: 56,
      y: 72
    },
    down: {
      w: 8,
      h: 8,
      x: 64,
      y: 72
    },
    stop: {
      w: 8,
      h: 8,
      x: 56,
      y: 80
    }
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

    const buttonData = this.buttonData[this.action || 'stop']
    constants.bgContext.drawImage(
      CTDLGAME.assets.dogeCoinMine,
      buttonData.x, buttonData.y, buttonData.w, buttonData.h,
      this.x - 8, this.y + this.minOffset + 8, buttonData.w, buttonData.h
    )
    constants.bgContext.drawImage(
      CTDLGAME.assets.dogeCoinMine,
      buttonData.x, buttonData.y, buttonData.w, buttonData.h,
      this.x + this.w, this.y + this.minOffset + 8, buttonData.w, buttonData.h
    )
    constants.bgContext.drawImage(
      CTDLGAME.assets.dogeCoinMine,
      buttonData.x, buttonData.y, buttonData.w, buttonData.h,
      this.x - 8, this.y + this.maxOffset + 8, buttonData.w, buttonData.h
    )
    constants.bgContext.drawImage(
      CTDLGAME.assets.dogeCoinMine,
      buttonData.x, buttonData.y, buttonData.w, buttonData.h,
      this.x + this.w, this.y + this.maxOffset + 8, buttonData.w, buttonData.h
    )
  }

  update = () => {
    let move = 0
    if (intersects(this.getBoundingBox('whole'), window.SELECTEDCHARACTER.getBoundingBox())) {
      let action = this.senseControls()
      if (action === 'stop') playSound('elevatorStop')
    }

    if (this.action === 'up' && this.offsetY > this.minOffset) {
      move = -3
      playSound('elevator')
    } else if (this.action === 'down' && this.offsetY < this.maxOffset) {
      move = 3
      playSound('elevator')
    }
    if (move === 0 && this.action !== 'stop') {
      playSound('elevatorStop')
      this.action = 'stop'
    }

    this.offsetY += move

    CTDLGAME.objects
      .filter(obj => obj.applyGravity)
      .filter(obj => intersects(this.getBoundingBox('real'), obj.getBoundingBox()))
      .map(obj => {
        moveObject(obj, { x: 0, y: move }, CTDLGAME.quadTree)
      })

    this.draw()
  }

  senseControls = () => {
    // TODO add controls for mobile
    const action = Object.keys(this.controls)
      .filter(key => window.KEYS.indexOf(key) !== -1)
      .map(key => this.controls[key])
      .pop()

    if (action) {
      window.SELECTEDCHARACTER.action.effect()
    }
    this.action = action || this.action
    return action
  }

  getBoundingBox = type => type === 'whole'
    ? ({
      id: this.id,
      x: this.x - 8,
      y: this.y,
      w: this.w + 16,
      h: this.h + this.maxOffset
    })
    : type === 'real'
    ? ({
      id: this.id,
      x: this.x + 6,
      y: this.y + this.offsetY,
      w: this.w - 12,
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