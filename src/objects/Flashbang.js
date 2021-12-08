import { CTDLGAME } from '../gameUtils'
import constants from '../constants'
import spriteData from '../sprites/items'
import { intersects, moveObject } from '../geometryUtils'
import Explosion from '../Explosion'
import { senseCharacters } from '../enemies/enemyUtils'
import GameObject from '../GameObject'

class Flashbang extends GameObject {
  constructor(id, options) {
    super(id, options)
    this.frame = 0
    this.senseRadius = 20 // explosion stunning radius
  }

  applyGravity = true
  spriteData = spriteData.flashbang
  w = 4
  h = 4
  countdown = 32

  draw = () => {
    if (this.frame >= this.spriteData.length) {
      this.frame = 0
    }

    let data = this.spriteData[this.frame]
    this.w = data.w
    this.h = data.h

    constants.gameContext.globalAlpha = data.opacity ?? 1
    constants.gameContext.drawImage(
      CTDLGAME.assets.items,
      data.x, data.y, this.w, this.h,
      this.x, this.y, this.w, this.h
    )
    constants.gameContext.globalAlpha = 1
  }

  applyPhysics = () => {
    if ((this.vx !== 0 || this.vy !== 0) && this.inViewport) {
      if (this.vx > 12) this.vx = 12
      if (this.vx < -12) this.vx = -12
      if (this.vy > 12) this.vy = 12
      if (this.vy < -12) this.vy = -12

      const hasCollided = moveObject(this, { x: this.vx , y: this.vy }, CTDLGAME.quadTree)
      if (hasCollided) {
        this.vy = 0
      }

      if (this.vx < 0) this.vx += 1
      if (this.vx > 0) this.vx -= 1
    }
  }

  update = () => {
    this.applyPhysics()
    if (this.vx !== 0 || this.vy !== 0) this.frame++

    this.countdown--
    if (this.countdown === 0) {
      this.exploding = 10
      window.SOUND.playSound('explode')
      CTDLGAME.objects.push(new Explosion(
        constants.fgContext,
        {
          x: this.getCenter().x,
          y: this.getCenter().y 
        }
      ))

      this.sensedEnemies = senseCharacters(this)
        .filter(enemy => intersects(enemy, this.getBoundingBox('explosion')))
        .map(enemy => enemy.stun(this.getCenter().x > enemy.getCenter().x ? 'right' : 'left'))
    }
    if (this.exploding === 0) this.remove = true

    if (this.exploding) {
      constants.fgContext.globalAlpha = this.exploding / 10
      constants.fgContext.fillStyle = '#FFF'
      constants.fgContext.fillRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
      constants.fgContext.globalAlpha = '1'
      this.exploding--

      return
    }

    this.draw()
  }

  getBoundingBox = type => type === 'explosion'
    ? ({
      id: this.id,
      x: this.x - 20,
      y: this.y - 20,
      w: this.w + 40,
      h: this.h + 40
    })
    : ({
      id: this.id,
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h
    })

  toJSON = this._toJSON
}

export default Flashbang