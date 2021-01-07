import { CTDLGAME } from '../gameUtils'
import constants from '../constants'
import spriteData from '../sprites/items'
import { intersects, moveObject } from '../geometryUtils'
import { playSound } from '../sounds'
import Explosion from '../Explosion'
import { senseCharacters } from '../enemies/enemyUtils'

class Flashbang {
  constructor(id, options) {
    this.id = id
    this.x = options.x
    this.y = options.y
    this.vx = options.vx
    this.vy = options.vy
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
      playSound('explode')
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

  getAnchor = () => ({
      x: this.getBoundingBox().x,
      y: this.getBoundingBox().y + this.getBoundingBox().h - 1,
      w: this.getBoundingBox().w,
      h: 1
  })

  getCenter = () => ({
    x: Math.round(this.x + this.w / 2),
    y: Math.round(this.y + this.h / 2)
  })

  select = () => {}

  toJSON = () => {
    let json = Object.keys(this)
    .filter(key => /string|number|boolean/.test(typeof this[key]))
    .reduce((obj, key) => {
      obj[key] = this[key]
      return obj
    }, {})
    json.class = this.constructor.name
    return json
  }
}

export default Flashbang