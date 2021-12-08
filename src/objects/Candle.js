import constants from '../constants'
import GameObject from '../GameObject'
import { easeInOutBounce } from '../geometryUtils/easeInOut'

class Candle extends GameObject {
  constructor(id, options) {
    super(id, options)
    this.soilColor = options.soilColor || '#654309'
    this.spawnCountdown = options.spawnCountdown || 4
    this.canPumpTo = options.canPumpTo || Math.round(Math.random() * 40 + 10)
    this.static = options.static
    this.progress = options.progress || 0
    this.duration = options.duration || 6 + Math.round(Math.random() * 12)
    this.shards = []

    // all relative to 0
    this.open = 0
    this.close = options.close || 0
    this.high = options.high || 0
    this.low = options.low || Infinity
  }

  applyGravity = false
  w = 5
  h = 0
  glows = true

  draw = () => {
    constants.gameContext.fillStyle = this.soilColor
    this.shards = this.shards
      .filter(shard => shard.halflife)
      .map(shard => {
        // TODO this could be refactored
        constants.gameContext.globalAlpha = Math.random() * .7
        constants.gameContext.fillRect(Math.round(shard.x), Math.round(shard.y), 1, 1)
        shard.x += shard.vx
        shard.y += shard.vy
        shard.halflife--
        return shard
      })


    this.h = Math.max(0, this.high - this.low)

    // draw candle
    constants.gameContext.fillStyle = this.close > this.open ? '#53b987' : '#eb4c5c'

    // draw shadows
    constants.gameContext.globalAlpha = .8
    constants.gameContext.fillRect(this.x + 2, this.y - this.high, 1, this.h)
    // draw body
    constants.gameContext.globalAlpha = 1
    constants.gameContext.fillRect(this.x, this.y - Math.max(this.open, this.close), this.w, Math.abs(this.open - this.close))
  }

  touch = character => {
    const direction = this.x > character.x ? 'left' : 'right'
    character.hurt(3, direction)
  }

  update = () => {
    if (this.static) {
      return this.draw()
    }
    if (this.spawnCountdown) {
      window.SOUND.playSound('rumble')
      for (let c = 0; c < 2; c++) {
        this.shards.push({
          x: this.x + Math.round(this.w  / 2),
          y: this.y + Math.round(this.h  / 2),
          vx: (Math.random() - .5) * 6,
          vy: (Math.random() - .5) * 6,
          halflife: 6
        })
      }
      this.spawnCountdown--
    } else {
      this.close = Math.round(this.canPumpTo * this.pumpCurve(this.progress * 2 / this.duration))
      this.high = Math.max(this.close, this.high)
      this.low = Math.min(this.close, this.low)
      this.progress++
    }

    if (this.progress >= this.duration) this.remove = true
    this.draw()
  }

  pumpCurve = x => {
    if (x < 1) {
      return easeInOutBounce(x)
    }

    return 1 - easeInOutBounce(x - 1)
  }

  getBoundingBox = () => ({
    id: this.id,
    x: this.x,
    y: this.y,
    w: this.w,
    h: this.h
  })

  toJSON = this._toJSON
}

export default Candle