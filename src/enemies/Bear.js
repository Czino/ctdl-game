import bearSprite from '../sprites/bear'
import Item from '../Item'
import { CTDLGAME } from '../gameUtils'
import { moveObject, intersects, getClosest } from '../geometryUtils'
import { write } from '../font'
import { addTextToQueue, setTextQueue } from '../textUtils'
import constants from '../constants'
import { playSound } from '../sounds'
import { senseCharacters } from './enemyUtils'
import { getSoundtrack, initSoundtrack } from '../soundtrack'

const items = [
  { id: 'honeybadger', chance: 1 }
]

export default function(id, options) {
  this.id = id
  this.class = 'Bear'
  this.applyGravity = true
  this.enemy = true
  this.health = options.health ?? Math.round(Math.random() * 20 + 40)
  this.item = options.item || items.find(item => item.chance >= Math.random())
  this.dmgs = []
  this.w = 27
  this.h = 28
  this.x = options.x
  this.y = options.y
  this.vx = options.vx || 0
  this.vy = options.vy || 0
  this.status = options.status || 'idle'
  this.direction = options.direction || 'left'
  this.frame = options.frame || 0
  this.walkingSpeed = 2
  this.attackRange = 2
  this.senseRadius = 160
  this.hadIntro = options.hadIntro
  this.canMove = options.canMove

  this.idle = () => {
    this.status = 'idle'
  }
  this.moveLeft = () => {
    if (/hurt|block|rekt/.test(this.status) || this.vy !== 0) return
    this.direction = 'left'
    const hasMoved =  moveObject(this, { x: -this.walkingSpeed, y: 0 }, CTDLGAME.quadTree)

    if (hasMoved) {
      this.status = 'move'
      if (this.frame % 5 === 0) playSound('drop')
    } else {
      this.idle()
    }
  }
  this.moveRight = () => {
    if (/hurt|block|rekt/.test(this.status) || this.vy !== 0) return
    this.kneels = false
    this.direction = 'right'

    const hasMoved = moveObject(this, { x: this.walkingSpeed , y: 0}, CTDLGAME.quadTree)
    if (hasMoved) {
      this.status = 'move'
      if (this.frame % 5 === 0) playSound('drop')
    } else {
      this.idle()
    }
  }

  this.hurt = (dmg, direction) => {
    if (/hurt|block|rekt/.test(this.status)) return

    if (dmg < 2 && Math.random() < .3) {
      if (Math.random() < .1) this.status = 'block'
      return
    } else if (dmg >= 2 && Math.random() < .3) {
      return
    }
    playSound('bearHurt')
    this.dmgs.push({y: -8, dmg})
    this.health = Math.max(this.health - dmg, 0)

    if (dmg > 2 && Math.random() < .5) {
      this.status = 'hurt'
      this.vy = -8
      this.vx = direction === 'left' ? 4 : -4
    }

    if (this.health <= 0) {
      this.health = 0
      this.die()
    }
  }
  this.die = () => {
    this.frame = 0
    this.status = 'rekt'

    setTextQueue([])
    addTextToQueue('Big Bear:\n*growl*', () => this.frame++)
    addTextToQueue(`The Big Bear got rekt\nthe bull run begins!`, () => {
      initSoundtrack(CTDLGAME.world.map.track)

      if (this.item) {
        let item = new Item(
          this.item.id,
          {
            x: this.x,
            y: this.y,
            vy: -8,
            vx: Math.round((Math.random() - .5) * 10)
          }
        )
        CTDLGAME.objects.push(item)
      }
    })
  }

  this.attack = enemy => {
    if (/hurt|block|rekt/.test(this.status) || this.vy !== 0) return

    if (this.status === 'attack' && this.frame === 2) {
      playSound('bearGrowl')
    }
    if (this.status === 'attack' && this.frame === 5) {
      playSound('woosh')
      let dmg = Math.round(Math.random() * 2) + 5
      return enemy.hurt(dmg, this.direction === 'left' ? 'right' : 'left')
    }
    if (this.status === 'attack') return

    this.frame = 0
    this.status = 'attack'
  }

  this.update = () => {
    const sprite = CTDLGAME.assets.bear

    if (this.vx !== 0) {
      if (this.vx > 6) this.vx = 6
      if (this.vx < -6) this.vx = -6

      moveObject(this, { x: this.vx , y: 0 }, CTDLGAME.quadTree)
      if (this.vx < 0) this.vx += 1
      if (this.vx > 0) this.vx -= 1
    }
    if (this.vy !== 0 && this.inViewport) {
      if (this.vy > 12) this.vy = 12
      if (this.vy < -12) this.vy = -12
      const hasCollided = !moveObject(this, { x: 0 , y: this.vy }, CTDLGAME.quadTree)

      if (hasCollided) this.vy = 0
    }

    if (!this.hadIntro && senseCharacters(this).length > 0) {
      CTDLGAME.lockCharacters = true
      constants.BUTTONS.find(btn => btn.action === 'skipCutScene').active = true

      playSound('bearGrowl')
      addTextToQueue('Big Bear:\n*rraawww*', () => {
        this.canMove = true
        CTDLGAME.lockCharacters = false
        constants.BUTTONS.find(btn => btn.action === 'skipCutScene').active = false
      })
      this.hadIntro = true
    }

    // AI logic
    if (this.canMove && !/rekt|spawn/.test(this.status)) {
      if (getSoundtrack() !== 'bear') initSoundtrack('bear')

      const enemies = senseCharacters(this)

      if (enemies.length > 0) {
        const enemy = getClosest(this.getCenter(), enemies)
        const attackBox = this.getCenter()
        attackBox.x -= this.w / 2
        attackBox.w = this.w
        attackBox.h = 1

        if (intersects(attackBox, enemy.getBoundingBox())) { // attack distance
          if (this.getCenter().x > enemy.getCenter().x) {
            this.direction = 'left'
          } else {
            this.direction = 'right'
          }
          this.attack(enemy)
        } else if (this.getBoundingBox().x > enemy.getBoundingBox().x + enemy.getBoundingBox().w - 1) {
          this.moveLeft()
        } else if (enemy.getBoundingBox().x > this.getBoundingBox().x + this.getBoundingBox().w - 1) {
          this.moveRight()
        } else {
          this.idle()
        }
      } else {
        this.idle()
      }
    }

    let spriteData = bearSprite[this.direction][this.status]

    if (!/rekt/.test(this.status)) this.frame++
    if (this.status === 'hurt' && this.frame === 3) this.status = 'idle'
    if (this.status === 'block' && Math.random() < .3) this.status = 'idle'

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
          x: this.getCenter().x - 4,
          y: this.y + dmg.y,
          w: 8
        }, 'left', false, 4, true, '#F00')
        return {
          ...dmg,
          y: dmg.y - 1
        }
      })
  }

  this.getBoundingBox = () => /idle|move/.test(this.status)
    ? ({
      id: this.id,
      x: this.x,
      y: this.y + 12,
      w: this.w,
      h: this.h - 12
    })
    : ({
      id: this.id,
      x: this.x + 5,
      y: this.y + 5,
      w: this.w - 8,
      h: this.h - 5
    })

  this.getAnchor = () => /idle|move/.test(this.status)
    ? ({
        x: this.getBoundingBox().x + 7,
        y: this.getBoundingBox().y + this.getBoundingBox().h - 1,
        w: this.getBoundingBox().w - 14,
        h: 1
    })
    : ({
      x: this.getBoundingBox().x,
      y: this.getBoundingBox().y + this.getBoundingBox().h - 1,
      w: this.getBoundingBox().w,
      h: 1
  })

  this.getCenter = () => ({
    x: Math.round(this.x + this.w / 2),
    y: Math.round(this.y + this.h / 2)
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
    health: this.health,
    direction: this.direction,
    hadIntro: this.hadIntro,
    canMove: this.canMove,
    frame: this.frame,
    item: this.item
  })
}