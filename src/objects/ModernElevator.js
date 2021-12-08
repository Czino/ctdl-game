import { CTDLGAME } from '../gameUtils'
import constants from '../constants'
import { intersects } from '../geometryUtils'
import GameObject from '../GameObject'
import { addTextToQueue } from '../textUtils'

class ModernElevator extends GameObject {
  constructor(id, options) {
    super(id, options)
    this.ys = typeof options.ys === 'string' ? JSON.parse(options.ys) : options.ys.sort((a, b) => a - b)
    this.y = this.ys[0]
    this.carY = options.carY || this.y
    this.h = this.ys[this.ys.length - 1] - this.y + this.spriteData.h
    this.action = options.action || 'stop'
    this.doorsOpen = options.doorsOpen ? JSON.parse(options.doorsOpen) : this.ys.map(() => 0)
    this.moveTo = options.moveTo
    this.locked = options.locked
  }

  controls = {
    w: 'up',
    s: 'down',
    i: 'up',
    k: 'down',
    npc: 'down'
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
        this.x + 1, y + 3, this.bgData.w, this.bgData.h
      )
      constants[doorContext].drawImage(
        CTDLGAME.assets.centralBank,
        this.doorLeft.x + doorOpen, this.doorLeft.y, this.doorLeft.w - doorOpen, this.doorLeft.h,
        this.x, y + 2, this.doorLeft.w - doorOpen, this.doorLeft.h
      )
      constants[doorContext].drawImage(
        CTDLGAME.assets.centralBank,
        this.doorRight.x, this.doorRight.y, this.doorRight.w - doorOpen, this.doorRight.h,
        this.x + 12 + doorOpen, y + 2, this.doorRight.w - doorOpen, this.doorRight.h
      )
    })
  }

  anyDoorOpen = () => this.doorsOpen.some(door => door > 0)
  doorsCompletelyOpen = () => this.doorsOpen.some(door => door === 12)

  update = () => {
    if (this.locked && !CTDLGAME.inventory.securityCard || CTDLGAME.bossFight) return this.draw()

    let move = 0

    this.sensedCharacters = CTDLGAME.quadTree.query(this.getBoundingBox())
      .filter(obj => /Character|SnakeBitken/.test(obj.getClass()))
      .filter(obj => intersects(this.getBoundingBox(), obj.getBoundingBox()))

    if (this.sensedCharacters.some(char => char.getClass() === 'SnakeBitken')) {
      this.sensedCharacter = this.sensedCharacters.find(char => char.getClass() === 'SnakeBitken')
    } else {
      this.sensedCharacter = this.sensedCharacters.find(char => char.id === window.SELECTEDCHARACTER.id)
    }

    this.ys.forEach((y, i) => {
      const boundingBox = {
        x: this.x, y,
        w: this.w, h: this.spriteData.h
      }
      if (this.sensedCharacter && intersects(boundingBox, this.sensedCharacter.getBoundingBox())) {
        if (this.doorsOpen[i] < 12 && /opening|stop/.test(this.action)) {
          this.doorsOpen[i]++
          return
        }

        if (!this.anyDoorOpen()) return

        this.triggeredAction = this.senseControls() || this.triggeredAction
        let spriteData = this.sensedCharacter.spriteData[this.sensedCharacter.direction][this.sensedCharacter.status]

        if (this.sensedCharacter.frame !== spriteData.length - 1) return

        if (i === 0 && this.triggeredAction === 'up') this.triggeredAction = null
        if (i === this.ys.length - 1 && this.triggeredAction === 'down') this.triggeredAction = null
        if (this.triggeredAction) {
          if (this.sensedCharacter.getClass() !== 'SnakeBitken') {
            [CTDLGAME.hodlonaut, CTDLGAME.katoshi].map(character => {
              character.locked = true
              character.context = 'bgContext'
              character.applyGravity = false
              character.status = 'idle'
              character.y = y + 4
            })
            CTDLGAME.hodlonaut.x = this.x
            CTDLGAME.katoshi.x = this.x + 8
          } else {
            this.sensedCharacter.context = 'bgContext'
          }
          this.action = this.triggeredAction
          this.triggeredAction = null
          this.carY = y
          if (this.action === 'up') this.moveTo = this.ys[i - 1]
          if (this.action === 'down') this.moveTo = this.ys[i + 1]
        }
      } else if (this.doorsOpen[i] > 0) {
        this.doorsOpen[i]--
        return
      }
    })

    // going to drive but doors are still open, close them
    if (!/opening|stop/.test(this.action) && this.anyDoorOpen()) {
      this.ys.forEach((y, i) => {
        if (this.doorsOpen[i] > 0) this.doorsOpen[i]--
      })
      this.draw()
      return
    }

    // has stopped and doors are open, set default character options
    if (this.action === 'opening' && this.doorsCompletelyOpen()) {
      [CTDLGAME.hodlonaut, CTDLGAME.katoshi].map(character => {
        character.locked = false
        character.context = 'charContext'
        character.applyGravity = true
      })
      this.action = 'stop'
    }

    if (this.action === 'up' && !this.anyDoorOpen()) {
      move = -4
      window.SOUND.playSound('elevator')
    } else if (this.action === 'down' && !this.anyDoorOpen()) {
      move = 4
      window.SOUND.playSound('elevator')
    }

    if (this.carY === this.moveTo) move = 0
    if (move === 0 && !/stop|opening/.test(this.action)) {
      this.sensedCharacters.map(character => {
        character.context = 'bgContext'
      })
      this.action = 'opening'
      window.SOUND.playSound('ding')
      this.draw()
      return
    }

    if (move === 0) return this.draw()

    this.carY += move
    this.sensedCharacters
      .map(character => {
        character.context = 'parallaxContext'
        character.y += move
      })

    this.draw()
  }

  backEvent = () => {
    if (this.locked && !this.touched && !CTDLGAME.inventory.securityCard || CTDLGAME.bossFight) {
      addTextToQueue('The elevator does not\nrespond', () => this.touched = false)
      this.touched = true
    }
  }

  senseControls = () => {
    // TODO add controls for mobile
    const action = Object.keys(this.controls)
      .filter(key => window.KEYS.indexOf(key) !== -1)
      .map(key => this.controls[key])
      .pop()

    if (action) {
      this.sensedCharacter.action.effect()
    }
    return action
  }

  getBoundingBox = () => ({
    id: this.id,
    x: this.x,
    y: this.y,
    w: this.w,
    h: this.h
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