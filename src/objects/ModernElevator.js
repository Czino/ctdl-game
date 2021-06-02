import { CTDLGAME } from '../gameUtils'
import constants from '../constants'
import { intersects, moveObject } from '../geometryUtils'
import { playSound } from '../sounds'
import GameObject from '../GameObject'

class ModernElevator extends GameObject {
  constructor(id, options) {
    super(id, options)
    this.ys = typeof options.ys === 'string' ? JSON.parse(options.ys) : options.ys.sort()
    this.y = this.ys[0]
    this.h = this.ys[this.ys.length - 1] - this.y
    this.doorsOpen = options.doorsOpen ? JSON.parse(options.doorsOpen) : this.ys.map(() => 0)
  }

  controls = {
    w: 'up',
    s: 'down',
    i: 'up',
    k: 'down',
    escape: 'stop'
  }
  spriteData = {
    x: 9 * 8,
    y: 8 * 8,
    w: 3 * 8,
    h: 4 * 8
  }
  doorLeft = {
    x: 9 * 8,
    y: 8 * 8,
    w: 3 * 8 / 2,
    h: 4 * 8
  }
  doorRight = {
    x: 9 * 8 + 12,
    y: 8 * 8,
    w: 12,
    h: 4 * 8
  }
  bgData = {
    x: 9 * 8 + 1,
    y: 1 * 8 + 1,
    w: 3 * 8 - 2,
    h: 4 * 8 - 1
  }
  w = 3 * 8
  h = 4 * 8

  draw = () => {
    this.ys.forEach((y, i) => {
      let doorOpen = this.doorsOpen[i]
      let doorContext = this.action !== 'stop' ? 'charContext' : 'bgContext'
      constants.bgContext.drawImage(
        CTDLGAME.assets.centralBank,
        this.bgData.x, this.bgData.y, this.bgData.w, this.bgData.h,
        this.x + 1, y + 1, this.bgData.w, this.bgData.h
      )
      constants[doorContext].drawImage(
        CTDLGAME.assets.centralBank,
        this.doorLeft.x + doorOpen, this.doorLeft.y, this.doorLeft.w - doorOpen, this.doorLeft.h,
        this.x, y, this.doorLeft.w - doorOpen, this.doorLeft.h
      )
      constants[doorContext].drawImage(
        CTDLGAME.assets.centralBank,
        this.doorRight.x, this.doorRight.y, this.doorRight.w - doorOpen, this.doorRight.h,
        this.x + 12 + doorOpen, y, this.doorRight.w - doorOpen, this.doorRight.h
      )
    })
  }

  anyDoorOpen = () => this.doorsOpen.some(door => door > 0)

  update = () => {
    let move = 0
    this.ys.forEach((y, i) => {
      const boundingBox = {
        x: this.x, y,
        w: this.w, h: this.spriteData.h
      }
      if (intersects(boundingBox, window.SELECTEDCHARACTER.getBoundingBox())) {
        if (this.doorsOpen[i] < 12)  {
          this.doorsOpen[i]++
          return
        }
        let action = this.senseControls()
      } else if (this.doorsOpen[i] > 0) {
        this.doorsOpen[i]--
        return
      }
    })

    if (this.action === 'up' && !this.anyDoorOpen()) {
      move = -3
      playSound('elevator')
    } else if (this.action === 'down') {
      move = 3
      playSound('elevator')
    }
    if (move === 0 && this.action !== 'stop') {
      playSound('elevatorStop')
      this.action = 'stop'
    }

    CTDLGAME.objects
      .filter(obj => obj.applyGravity)
      .filter(obj => intersects(this.getBoundingBox('real'), obj.getBoundingBox()))
      .map(obj => {
        if (this.action === 'down') {
          moveObject(obj, { x: 0, y: move }, CTDLGAME.quadTree)
        } else {
          obj.y += move
        }
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
      y: this.y,
      w: this.w,
      h: 2
    })

  getAnchor = () => ({
      x: this.getBoundingBox().x + 2,
      y: this.getBoundingBox().y + this.getBoundingBox().h - 1,
      w: this.getBoundingBox().w - 5,
      h: 1
  })

  toJSON = () => {
    // technical debt: we avoid arrays by storing the data as a string
    this.ys = JSON.stringify(this.ys)
    let json = this._toJSON()
    this.ys = JSON.parse(this.ys)
    return json
  }
}

export default ModernElevator