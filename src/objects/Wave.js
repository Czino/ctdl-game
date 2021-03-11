import { CTDLGAME } from '../gameUtils'
import constants from '../constants'
import { intersects } from '../geometryUtils'
import GameObject from '../GameObject'

class Wave extends GameObject {
  constructor(id, options) {
    super(id, options)
  }

  applyGravity = true
  w = 79
  h = 55

  draw = () => {
    constants.fgContext.drawImage(
      CTDLGAME.assets.wave,
      0, 0, this.w, this.h,
      this.x, this.y, this.w, this.h
    )
  }

  applyPhysics = () => {
    if ((this.vx !== 0 || this.vy !== 0) && this.inViewport) {
      this.x += this.vx
      this.y += this.vy

      if (this.vx > 0) this.vx -= 1
    }
  }

  update = () => {
    this.applyPhysics()


    this.sensedObjects = 

    this.sensedEnemies = CTDLGAME.quadTree.query(this.getBoundingBox())
      .filter(obj => obj && /Character|Human|NakadaiMonarch/.test(obj.getClass()) && obj.status !== 'rekt')
      .filter(obj => /duck/.test(obj.status))
      .filter(enemy => intersects(enemy, this.getBoundingBox()))
      .map(enemy => {
        enemy.stun(this.vx < 0 ? 'right' : 'left', 4)
        enemy.vy = 0
      })

    if (this.y > CTDLGAME.world.h) this.remove = true
    this.draw()
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

export default Wave