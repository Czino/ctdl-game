import rabbit from './sprites/rabbit'
import { CTDLGAME } from './gameUtils'
import { moveObject, intersects, getClosest } from './geometryUtils'
import { write } from './font';
import { addTextToQueue } from './textUtils';
import constants from './constants';
import { playSound } from './sounds';

const sprites = {
  rabbit
}

export default function(id, options) {
  this.id = id;
  this.class = 'Rabbit'
  this.applyGravity = true
  this.enemy = options.isEvil ?? false
  this.spriteData = sprites.rabbit
  this.health = options.health ?? Math.round(Math.random() * 2 + 1)
  this.item = null
  this.dmgs = []
  this.w = 8
  this.h = 6
  this.x = options.x
  this.y = options.y
  this.vx = options.vx || 0
  this.vy = options.vy || 0
  this.status = options.status || 'idle'
  this.direction = options.direction || 'right'
  this.turnEvilRate = 0.01
  this.canTurnEvil = options.canTurnEvil || Math.random() > .5
  this.isEvil = options.isEvil ?? false
  this.frame = options.frame || 0
  this.walkingSpeed = options.walkingSpeed || Math.round(Math.random() * 3 + 4)
  this.senseRadius = Math.round(Math.random() * 50 + 30)

  this.idle = () => {
    this.status = 'idle'
  }
  this.moveLeft = () => {
    if (/turnEvil|jump|spawn|hurt|rekt/.test(this.status) || this.vy !== 0) return
    this.direction = 'left'
    const hasMoved =  moveObject(this, { x: -this.walkingSpeed, y: 0 }, CTDLGAME.quadTree)

    if (hasMoved) {
      this.status = 'move'
    } else {
      let jumpTo = this.getBoundingBox()
      jumpTo.y -=4
      jumpTo.x -= 3
      jumpTo.w += 3
      jumpTo.h = 24

      let obstacles = CTDLGAME.quadTree.query(jumpTo)
        .filter(obj => obj.isSolid && !obj.enemy)
        .filter(obj => intersects(obj, jumpTo))

      let canJump = obstacles.length === 0
      if (canJump) this.jump()
    }
  }
  this.moveRight = () => {
    if (/turnEvil|jump|spawn|hurt|rekt/.test(this.status) || this.vy !== 0) return
    this.direction = 'right'

    const hasMoved = moveObject(this, { x: this.walkingSpeed , y: 0}, CTDLGAME.quadTree)
    if (hasMoved) {
      this.status = 'move'
    } else {
      let jumpTo = this.getBoundingBox()
      jumpTo.y -=4
      jumpTo.w += 3
      jumpTo.h = 24

      let obstacles = CTDLGAME.quadTree.query(jumpTo)
        .filter(obj => obj.isSolid && !obj.enemy)
        .filter(obj => intersects(obj, jumpTo))

      let canJump = obstacles.length === 0
      if (canJump) this.jump()
    }
  }
  this.jump = () => {
    // if (/turnEvil|spawn|hurt|rekt/.test(this.status) || this.vy !== 0) return

    // this.status = 'jump'

    // if (this.frame !== 10) return
    // moveObject(this, { x: this.direction === 'left' ? -3 : 3 , y: -6}, CTDLGAME.quadTree)
    this.status = 'idle'
  }

  this.bite = prey => {
    if (/turnEvil|spawn|hurt|rekt|burning/.test(this.status) || this.vy !== 0) return

    if (this.status === 'bite' && this.frame === 2) {
      this.frame = 0
      return prey.hurt(.5, this.direction === 'left' ? 'right' : 'left')
    }
    if (this.status === 'bite') return

    this.status = 'bite'
  }

  this.hurt = (dmg, direction) => {
    if (!this.isEvil || /turnEvil|spawn|hurt|rekt/.test(this.status)) return
    playSound('rabbitHurt')
    this.dmgs.push({y: -8, dmg})
    this.health = Math.max(this.health - dmg, 0)
    this.status = 'hurt'
    this.vx = direction === 'left' ? 2 : -2
    if (this.health <= 0) {
      this.health = 0
      this.die()
    }
  }
  this.die = () => {
    playSound('burn')
    addTextToQueue(`evil rabbit got rekt`)
    this.status = 'rekt'
  }

  this.senseEnemies = () => {
    let preys = CTDLGAME.quadTree.query({
      x: this.x - this.senseRadius,
      y: this.y - this.senseRadius,
      w: this.w + this.senseRadius * 2,
      h: this.h + this.senseRadius * 2
    })
      .filter(prey => prey.class === 'Character')
      .filter(prey => Math.abs(prey.getCenter().x - this.getCenter().x) <= this.senseRadius)

    return getClosest(this.getCenter(), preys)
  }

  this.update = () => {
    const sprite = CTDLGAME.assets.rabbit

    if (CTDLGAME.lockCharacters) {
      let data = this.spriteData[this.direction][this.status][0]
      constants.charContext.globalAlpha = 1

      constants.charContext.drawImage(
        sprite,
        data.x, data.y, this.w, this.h,
        this.x, this.y, this.w, this.h
      )
      return
    }

    if (this.vx !== 0) {
      if (this.vx > 6) this.vx = 6
      if (this.vx < -6) this.vx = -6

      moveObject(this, { x: this.vx , y: 0 }, CTDLGAME.quadTree)
      if (this.vx < 0) this.vx += 1
      if (this.vx > 0) this.vx -= 1
    }
    if (this.status === 'jump') {
      this.vy = 0
      this.jump()
    }
    if (this.vy !== 0 && this.inViewport) {
      if (this.vy > 6) this.vy = 6
      if (this.vy < -6) this.vy = -6
      const hasCollided = !moveObject(this, { x: 0 , y: this.vy }, CTDLGAME.quadTree)

      if (hasCollided) this.vy = 0
    }

    // AI logic
    if (!this.isEvil && this.canTurnEvil && Math.random() < this.turnEvilRate) {
      this.status = 'turnEvil'
    }
    if (!/turnEvil|rekt|spawn/.test(this.status)) {
      const prey = this.senseEnemies()
      if (prey) {
        if (this.isEvil) {
          if (intersects(this.getBoundingBox(), prey.getBoundingBox())) { // biting distance
            if (this.getCenter().x > prey.getCenter().x) {
              this.direction = 'left'
            } else {
              this.direction = 'right'
            }
            this.bite(prey)
          } else if (this.getBoundingBox().x > prey.getBoundingBox().x + prey.getBoundingBox().w - 1) {
            this.moveLeft()
          } else if (prey.getBoundingBox().x > this.getBoundingBox().x + this.getBoundingBox().w - 1) {
            this.moveRight()
          }
        } else if (!this.canTurnEvil) {
          if (this.getCenter().x < prey.getCenter().x) {
            this.moveLeft()
          } else if (prey.getCenter().x <= this.getCenter().x) {
            this.moveRight()
          }
        } else {
          if (Math.random() < .03) {
            this.moveLeft()
          } else if (Math.random() < .03) {
            this.moveRight()
          } else {
            this.idle()
          }
        }
      } else {
        if (Math.random() < .03) {
          this.moveLeft()
        } else if (Math.random() < .03) {
          this.moveRight()
        } else {
          this.idle()
        }
      }
    }

    let spriteData = this.spriteData[this.isEvil ? 'evil' : 'good'][this.direction][this.status]

    if (this.status !== 'idle' || Math.random() < .1) this.frame++
    if (this.status === 'hurt' && this.frame === 3) {
      this.status = 'idle'
    }
    if (this.status === 'spawn' && this.frame === 6) {
      this.status = 'idle'
    }
    if (this.status === 'turnEvil' && this.frame === 3 && Math.random() < .5) {
      this.isEvil = true
      this.enemy = true
      this.status = 'idle'
    }
    if (this.status === 'rekt' && this.frame === 3) {
      this.remove = true
    }
    if (this.frame >= spriteData.length) {
      this.frame = 0
    }

    let data = spriteData[this.frame]
    this.w = data.w
    this.h = data.h

    constants.gameContext.drawImage(
      sprite,
      data.x, data.y, this.w, this.h,
      this.x, this.y, this.w, this.h
    )

    this.dmgs = this.dmgs
      .filter(dmg => dmg.y > -24)
      .map(dmg => {
        write(constants.gameContext, `-${dmg.dmg}`, {
          x: this.getCenter().x - 2,
          y: this.y + dmg.y,
          w: this.getBoundingBox().w
        }, 'left', false, 4, true, '#F00')
        return {
          ...dmg,
          y: dmg.y - 1
        }
      })
  }

  this.getBoundingBox = () => ({
    id: this.id,
    x: this.x,
    y: this.y,
    w: this.w,
    h: this.h
  })

  this.getAnchor = () => ({
      x: this.getBoundingBox().x,
      y: this.getBoundingBox().y + this.getBoundingBox().h,
      w: this.getBoundingBox().w,
      h: 1
  })

  this.getCenter = () => ({
    x: this.x + this.w / 2,
    y: this.y + this.h / 2
  })

  this.select = () => {}

  this.toJSON = () => ({
    id: this.id,
    class: this.class,
    w: this.w,
    h: this.h,
    x: this.x,
    y: this.y,
    vx: this.vx,
    vy: this.vy,
    status: this.status,
    direction: this.direction,
    frame: this.frame,
    isEvil: this.isEvil,
    canTurnEvil: this.canTurnEvil,
    walkingSpeed: this.walkingSpeed,
    senseRadius: this.senseRadius
  })
}