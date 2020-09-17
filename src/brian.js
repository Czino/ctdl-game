import brian from './sprites/brian'
import Item from './item'
import { CTDLGAME } from './gameUtils'
import { moveObject, intersects, getClosest } from './geometryUtils'
import { write } from './font';
import { addTextToQueue, setTextQueue } from './textUtils';
import constants from './constants';
import { playSound } from './sounds';

const sprites = {
  brian
}
const items = [
  { id: 'pizza', chance: 0.01 },
  { id: 'taco', chance: 0.02 },
  { id: 'opendime', chance: 0.3 },
  { id: 'coldcard', chance: 0.05 }
]

export default function(id, options) {
  this.id = id;
  this.class = 'Brian'
  this.enemy = true
  this.spriteData = sprites.brian
  this.health = 5
  this.usd = options.usd ?? Math.round(Math.random() * 400 + 200)
  this.item = items.find(item => item.chance > Math.random())
  this.dmgs = []
  this.w = 16
  this.h = 30
  this.x = options.x
  this.y = options.y
  this.vx = options.vx || 0
  this.vy = options.vy || 0
  this.status = options.status || 'idle'
  this.direction = options.direction || 'right'
  this.frame = options.frame || 0
  this.walkingSpeed = options.walkingSpeed || 3
  this.senseRadius = 60
  this.attackRange = 1

  this.idle = () => {
    this.status = 'idle'
  }
  this.moveLeft = () => {
    if (/hurt|rekt/.test(this.status) || this.vy !== 0) return
    this.direction = 'left'
    const hasMoved =  moveObject(this, { x: -this.walkingSpeed, y: 0 }, CTDLGAME.quadTree)

    if (hasMoved) {
      this.status = 'move'
    }
  }
  this.moveRight = () => {
    if (/hurt|rekt/.test(this.status) || this.vy !== 0) return
    this.direction = 'right'

    const hasMoved = moveObject(this, { x: this.walkingSpeed , y: 0}, CTDLGAME.quadTree)
    if (hasMoved) {
      this.status = 'move'
    }
  }

  this.hurt = (dmg, direction) => {
    if (/hurt|rekt/.test(this.status)) return

    playSound('shitcoinerHurt')
    this.dmgs.push({y: -12, dmg})
    this.health = Math.max(this.health - dmg, 0)
    this.status = 'hurt'
    if (this.health <= 0) {
      this.health = 0
      this.die()
    }
  }
  this.die = () => {
    CTDLGAME.inventory.usd += this.usd
    // TODO add defeated text
    this.status = 'rekt'
    this.frame = 0
    setTextQueue([])
    addTextToQueue('Brian:\nHow could this happen?', () => this.frame++)
    addTextToQueue('Brian:\nI am ruined..', () => {
      this.frame++
      playSound('drop')
    })
    addTextToQueue('Brian:\nI should have stayed\nBitcoin only...')
    addTextToQueue(`Brian got rekt,\nyou found $${this.usd}`, () => {
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
    if (/hurt|rekt/.test(this.status) || this.vy !== 0) return
    const dmg = Math.round(Math.random()) * 2 + 3

    if (this.status === 'attack' && this.frame === 3) {
      playSound('woosh')
      return enemy.hurt(dmg, this.direction === 'left' ? 'right' : 'left')
    }
    if (this.status === 'attack' && this.frame < 4) return

    this.frame = 0
    this.status = 'attack'
  }
  this.hurtAttack = () => {
    if (/rekt/.test(this.status) || this.vy !== 0) return
    this.status = 'hurtAttack'

    const enemies = this.senseEnemies()
    const attackBox = this.getBoundingBox()
    attackBox.x -= this.attackRange
    attackBox.w += this.attackRange * 2

    playSound('woosh')

    enemies
      .filter(enemy => intersects(attackBox, enemy.getBoundingBox()))
      .forEach(enemy => {
        const dmg = Math.round(Math.random()) * 1 + 3
        const direction = this.getCenter().x > enemy.getCenter().x ? 'right' : 'left'
        enemy.hurt(dmg, direction)
      })
  }
  this.senseEnemies = () => {
    let enemies = CTDLGAME.quadTree.query({
      x: this.x - this.senseRadius,
      y: this.y - this.senseRadius,
      w: this.w + this.senseRadius,
      h: this.h + this.senseRadius
    })
      .filter(enemy => enemy.class === 'Character')
      .filter(enemy => Math.abs(enemy.getCenter().x - this.getCenter().x) <= this.senseRadius)

    return enemies
  }

  this.update = () => {
    const sprite = CTDLGAME.assets.brian

    if (this.vx !== 0) {
      if (this.vx > 6) this.vx = 6
      if (this.vx < -6) this.vx = -6

      moveObject(this, { x: this.vx , y: 0 }, CTDLGAME.quadTree)
      if (this.vx < 0) this.vx += 1
      if (this.vx > 0) this.vx -= 1
    }

    if (this.vy !== 0) {
      if (this.vy > 12) this.vy = 12
      if (this.vy < -12) this.vy = -12
      const hasCollided = !moveObject(this, { x: 0 , y: this.vy }, CTDLGAME.quadTree)

      if (hasCollided) this.vy = 0
    }

    // AI logic
    if (!/rekt|hurt/.test(this.status)) {
      const enemies = this.senseEnemies()
      if (enemies.length > 0) {
        const enemy = getClosest(this.getCenter(), enemies)
        const attackBox = this.getBoundingBox()
        attackBox.x -= this.attackRange
        attackBox.w += this.attackRange * 2
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
        }
      } else {
        this.idle()
      }
    }

    let spriteData = this.spriteData[this.direction][this.status]

    if (!/hurt|rekt/.test(this.status)) this.frame++
    if (this.status === 'hurtAttack' && Math.random() < .25) this.status = 'idle'

    if (this.status === 'hurt' && Math.random() < .1) {
      this.hurtAttack()
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
      .filter(dmg => dmg.y > -30)
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
    x: this.x + 5,
    y: this.y + 3,
    w: this.w - 10,
    h: this.h - 4
  })

  this.getCenter = () => ({
    x: this.x + this.w / 2,
    y: this.y + this.h / 2
  })

  this.select = () => {
    if (this.status === 'rekt') return addTextToQueue('Brian:\nLeave me alone...')
    setTextQueue([])
    addTextToQueue('Brian:\nCompliance is key to digital currencys\' success!')
  }

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
    walkingSpeed: this.walkingSpeed
  })
}