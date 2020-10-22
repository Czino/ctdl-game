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
import Agent from '../Agent'

const items = [
  { id: 'honeybadger', chance: 1 }
]

class Bear extends Agent {
  constructor(id, options) {
    super(id, options)
    this.health = options.health ?? Math.round(Math.random() * 20 + 40)
    this.item = options.item || items.find(item => item.chance >= Math.random())
    this.hadIntro = options.hadIntro
    this.canMove = options.canMove
  }

  class = 'Bear'
  enemy = true
  w = 27
  h = 28
  walkingSpeed = 2
  attackRange = 2
  senseRadius = 160


  idle = {
    condition: () => !/hurt|block|fall|rekt/.test(this.status) && this.vy === 0,
    effect: () => {
      this.status = 'idle'
      return true
    }
  }
  moveLeft = {
    condition: () => !/hurt|block|fall|rekt/.test(this.status) && this.vy === 0,
    effect: () => {
      this.direction = 'left'
      const hasMoved =  moveObject(this, { x: -this.walkingSpeed, y: 0 }, CTDLGAME.quadTree)

      if (hasMoved) {
        this.status = 'move'
        if (this.frame % 5 === 0) playSound('drop')
        return true
      }
      return false
    }
  }
  moveRight = {
    condition: () => !/hurt|block|fall|rekt/.test(this.status) && this.vy === 0,
    effect: () => {
      this.direction = 'right'

      const hasMoved = moveObject(this, { x: this.walkingSpeed , y: 0}, CTDLGAME.quadTree)
      if (hasMoved) {
        this.status = 'move'
        if (this.frame % 5 === 0) playSound('drop')
        return true
      }
      return false
    }
  }
  attack = {
    condition: () => !/hurt|block|fall|rekt/.test(this.status) && this.vy === 0,
    effect: ({ enemy }) => {
      if (this.status === 'attack' && this.frame === 2) {
        playSound('bearGrowl')
      }
      if (this.status === 'attack' && this.frame === 5) {
        playSound('woosh')
        let dmg = Math.round(Math.random() * 2) + 5
        enemy.hurt(dmg, this.direction === 'left' ? 'right' : 'left')
        return true
      }
      if (this.status === 'attack') return true

      this.frame = 0
      this.status = 'attack'
      return true
    }
  }
  moveTo = {
    condition: ({ other }) => Math.abs(other.getCenter().x - this.getCenter().x) <= this.senseRadius,
    effect: ({ other, distance }) => {
      let action = 'idle'

      if (this.getBoundingBox().x > other.getBoundingBox().x + other.getBoundingBox().w + distance) {
        action = 'moveLeft'
      } else if (other.getBoundingBox().x > this.getBoundingBox().x + this.getBoundingBox().w + distance) {
        action = 'moveRight'
      }
      if (this[action].condition()) return this[action].effect()
      return false
    }
  }

  onHurt = () => playSound('bearHurt')

  hurt = (dmg, direction) => {
    if (/hurt|block|rekt/.test(this.status)) return

    if (dmg < 2 && Math.random() < .9) {
      if (Math.random() < .1) this.status = 'block'
      return
    } else if (dmg >= 2 && Math.random() < .3) {
      return
    }
    
    this.dmgs.push({y: -8, dmg})
    this.health = Math.max(this.health - dmg, 0)

    if (dmg > 2 && Math.random() < .5) {
      this.status = 'hurt'
      this.vy = -8
      this.vx = direction === 'left' ? 4 : -4
    }

    if (this.health <= 0) {
      this.health = 0
      return this.die()
    }

    return this.onHurt()
  }

  onDie = () => {
    this.frame = 0

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

  die = () => {
    this.status = 'rekt'

    return this.onDie()
  }

  update = () => {
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

    this.sensedEnemies = senseCharacters(this)

    if (!this.hadIntro && this.sensedEnemies.length > 0) {
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
    let action = { id: 'idle' }
    if (this.canMove && !/rekt|spawn/.test(this.status)) {
      if (getSoundtrack() !== 'bear') initSoundtrack('bear')

      if (this.sensedEnemies.length > 0) {
        const enemy = getClosest(this.getCenter(), this.sensedEnemies)
        const attackBox = this.getCenter()
        attackBox.x -= this.w / 2
        attackBox.w = this.w + this.attackRange
        attackBox.h = 9

        if (window.DRAWSENSORS) {
          constants.overlayContext.fillStyle = 'red'
          constants.overlayContext.fillRect(attackBox.x, attackBox.y, attackBox.w, attackBox.h)
        }
        if (intersects(attackBox, enemy.getBoundingBox())) { // attack distance
          if (this.getCenter().x > enemy.getCenter().x) {
            this.direction = 'left'
          } else {
            this.direction = 'right'
          }
          action.id = 'attack'
          action.payload = { enemy }
        } else {
          action.id = 'moveTo'
          action.payload = { other: enemy, distance: -2 }
        }
      }
    }
    if (this[action.id].condition(action.payload)) {
      action.success = this[action.id].effect(action.payload)
    }
    if (!action.success && this.idle.condition()) {
      this.idle.effect()
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
          x: this.getCenter().x - 6,
          y: this.y + dmg.y,
          w: 12
        }, 'center', false, 4, true, '#F00')
        return {
          ...dmg,
          y: dmg.y - 1
        }
      })
  }

  getBoundingBox = () => /idle|move/.test(this.status)
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

  getAnchor = () => /idle|move/.test(this.status)
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
}

export default Bear