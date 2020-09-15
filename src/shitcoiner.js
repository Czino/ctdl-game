import shitcoiner from './sprites/shitcoiner'
import Item from './item'
import { moveObject, intersects, getClosest } from './geometryUtils'
import { write } from './font';
import { addTextToQueue } from './textUtils';
import constants from './constants';
import { playSound } from './sounds';

const sprites = {
  shitcoiner
}
const items = [
  { id: 'pizza', chance: 0.05 },
  { id: 'taco', chance: 0.02 },
  { id: 'opendime', chance: 0.01 }
]

export default function(id, context, quadTree, options) {
  this.id = id;
  this.class = 'Shitcoiner'
  this.enemy = true
  this.spriteData = sprites.shitcoiner
  this.quadTree = quadTree
  this.context = context
  this.selected = options.selected
  this.health = options.health ?? Math.round(Math.random() * 7 + 1)
  this.usd = options.usd ?? Math.round(Math.random() * 4 + 1)
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
  this.kneels = false
  this.frame = options.frame || 0
  this.walkingSpeed = options.walkingSpeed || 2
  this.senseRadius = Math.random() * 50 + 30

  this.idle = () => {
    this.status = 'idle'
  }
  this.moveLeft = () => {
    if (/spawn|hurt|rekt|burning/.test(this.status) || this.vy !== 0) return
    this.kneels = false
    this.direction = 'left'
    const hasMoved =  moveObject(this, { x: -this.walkingSpeed, y: 0 }, this.quadTree)

    if (hasMoved) {
      this.status = 'move'
    }
  }
  this.moveRight = () => {
    if (/spawn|hurt|rekt|burning/.test(this.status) || this.vy !== 0) return
    this.kneels = false
    this.direction = 'right'

    const hasMoved = moveObject(this, { x: this.walkingSpeed , y: 0}, this.quadTree)
    if (hasMoved) {
      this.status = 'move'
    }
  }

  this.hurt = (dmg, direction) => {
    if (/spawn|hurt|rekt|burning/.test(this.status)) return

    playSound('shitcoinerHurt')
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
    CTDLGAME.inventory.usd += this.usd
    addTextToQueue(`Shitcoiner got rekt,\nyou found $${this.usd}`)

    this.status = 'rekt'

    if (this.item) {
      let item = new Item(
        this.item.id,
        constants.gameContext,
        window.CTDLGAME.quadTree,
        {
          x: this.x,
          y: this.y,
          vy: -8,
          vx: Math.round((Math.random() - .5) * 10)
        }
      )
      window.CTDLGAME.objects.push(item)
    }
  }

  this.bite = (prey) => {
    if (/spawn|hurt|rekt|burning/.test(this.status) || this.vy !== 0) return

    this.kneels = prey.status === 'rekt'

    if (this.status === 'bite' && this.frame === 3) {
      return prey.hurt(1, this.direction === 'left' ? 'right' : 'left')
    }
    if (this.status === 'bite') return

    this.frame = 0
    this.status = 'bite'
  }
  this.sensePrey = () => {
    let preys = this.quadTree.query({
      x: this.x - this.senseRadius,
      y: this.y - this.senseRadius,
      w: this.w + this.senseRadius,
      h: this.h + this.senseRadius
    })
      .filter(prey => prey.class === 'Character')
      .filter(prey => Math.abs(prey.getCenter().x - this.getCenter().x) <= this.senseRadius)

    return getClosest(this.getCenter(), preys)
  }

  this.update = () => {
    const sprite = window.CTDLGAME.assets.shitcoiner

    if (this.vx !== 0) {
      if (this.vx > 6) this.vx = 6
      if (this.vx < -6) this.vx = -6

      moveObject(this, { x: this.vx , y: 0 }, this.quadTree)
      if (this.vx < 0) this.vx += 1
      if (this.vx > 0) this.vx -= 1
    }
    if (this.vy !== 0) {
      if (this.vy > 12) this.vy = 12
      if (this.vy < -12) this.vy = -12
      const hasCollided = !moveObject(this, { x: 0 , y: this.vy }, this.quadTree)

      if (hasCollided) this.vy = 0
    }

    // AI logic
    if (!/rekt|burning|spawn/.test(this.status)) {
      const prey = this.sensePrey()
      if (prey) {
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
      } else {
        this.idle()
      }
    }

    let spriteData = this.spriteData[this.direction][this.status]

    if (this.status !== 'rekt' && this.kneels) {
      spriteData = this.spriteData[this.direction][this.status + '-kneels']
    }
    
    this.frame++
    if (this.status === 'hurt' && this.frame === 3) {
      this.status = 'idle'
    }
    if (this.status === 'spawn' && this.frame === 3) {
      this.status = 'idle'
    }
    if (this.frame >= spriteData.length) {
      this.frame = 0
    }

    let data = spriteData[this.frame]
    this.w = data.w
    this.h = data.h

    this.context.drawImage(
      sprite,
      data.x, data.y, this.w, this.h,
      this.x, this.y, this.w, this.h
    )

    this.dmgs = this.dmgs
      .filter(dmg => dmg.y > -24)
      .map(dmg => {
        write(this.context, `-${dmg.dmg}`, {
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

  this.select = () => {}

  this.toJSON = () => ({
    id: this.id,
    class: this.class,
    selected: this.selected,
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