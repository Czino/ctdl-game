import { CTDLGAME } from '../gameUtils'
import constants from '../constants'
import spriteData from '../sprites/shitcoins'
import { moveObject } from '../geometryUtils'
import GameObject from '../GameObject'
import { random } from '../arrayUtils'

class Shitcoin extends GameObject {
  constructor(id, options) {
    super(id, options)
    this.spriteData = random(spriteData)
    this.health = options.health ?? Math.round(Math.random() * 3)
    this.removeCountdown = options.removeCountdown || 8
    this.applyGravity = options.applyGravity ?? true

    this.color = this.spriteData.color
    this.shards = []
  }

  enemy = true
  w = 9
  h = 9

  draw = () => {
    let data = this.spriteData

    constants.gameContext.globalAlpha = data.opacity ?? 1
    constants.gameContext.drawImage(
      CTDLGAME.assets.shitcoins,
      data.x, data.y, data.w, data.h,
      this.x - this.w * Math.sin(CTDLGAME.frame / 12) / 2, this.y, this.w * Math.sin(CTDLGAME.frame / 12), this.h
    )
    constants.gameContext.globalAlpha = 1
  }

  hurt = dmg => {
    if (this.health === 0) return
    this.health = Math.max(this.health - dmg, 0)
    if (this.health <= 0) {
      this.health = 0
      window.SOUND.playSound('block')
      for (let c = 0; c < 5; c++) {
        this.shards.push({
          x: this.x + Math.round(this.w  / 2),
          y: this.y + Math.round(this.h  / 2),
          vx: (Math.random() - .5) * 6,
          vy: (Math.random() - .5) * 6
        })
      }
    }
  }

  touch = (character, callback) => {
    if (this.vx && character.getClass() === 'Character' && this.health > 0) {
      character.hurt(2, this.vx > 0 ? 'left' : 'right')
      this.hurt(999)
    }
    if (!callback || this.health === 0 || this.collected || this.vy < 0) return

    callback(this)
  }

  applyPhysics = () => {
    if ((this.vx !== 0 || this.vy !== 0) && this.inViewport) {
      if (this.vx > 12) this.vx = 12
      if (this.vx < -12) this.vx = -12
      if (this.vy > 12) this.vy = 12
      if (this.vy < -12) this.vy = -12

      const hasCollided = moveObject(this, { x: this.vx , y: this.vy }, CTDLGAME.quadTree)
      if (hasCollided && this.vx) {
        this.hurt(999)
      }
    }
  }

  update = () => {
    this.applyPhysics()

    if (this.vx && !this.inViewport) this.remove = true
    if (this.health > 0) {
      this.draw()
    } else {
      constants.gameContext.fillStyle = this.color
      this.shards = this.shards.map(shard => {
        constants.gameContext.globalAlpha = Math.random()
        constants.gameContext.fillRect(Math.round(shard.x), Math.round(shard.y), 1, 1)
        shard.x += shard.vx
        shard.y += shard.vy
        return shard
      })
      this.removeCountdown--
      constants.gameContext.globalAlpha = 1

      if (this.removeCountdown === 0) {
        this.remove = true
      }
    }
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

export default Shitcoin