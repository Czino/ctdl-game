import hodlonaut from './sprites/hodlonaut'
import katoshi from './sprites/katoshi'
import { moveObject, intersects, getClosest } from './geometryUtils'
import { capitalize } from './stringUtils'
import { write } from './font';
import constants from './constants'
import { addTextToQueue } from './gameUtils';
import { playSound } from './sounds';

const sprites = {
  hodlonaut,
  katoshi
}

export default function(id, context, quadTree, options) {
  this.id = id;
  this.class = 'Character'
  this.spriteData = sprites[id]
  this.quadTree = quadTree
  this.context = context
  this.maxHealth = options.maxHealth ?? 21
  this.health = options.health ?? 21
  this.dmgs = []
  this.heals = []
  this.selected = options.selected
  this.w = 16
  this.h = 30
  this.x = options.x
  this.y = options.y
  this.vx = options.vx || 0
  this.vy = options.vy || 0
  this.strength = id === 'hodlonaut' ? 1 : 3
  this.attackRange = id === 'hodlonaut' ? 1 : 5
  this.senseRadius = 50
  this.status = options.status || 'idle'
  this.direction = options.direction || 'right'
  this.frame = options.frame || 0
  this.walkingSpeed = options.walkingSpeed || 3

  this.idle = () => {
    if (/jump|fall|action|hurt|rekt/.test(this.status)) return
    this.status = 'idle'
  }
  this.moveLeft = () => {
    if (/jump|fall|action|hurt|rekt/.test(this.status)|| this.vy !== 0) return
    this.direction = 'left'
    const hasMoved =  moveObject(this, { x: -this.walkingSpeed, y: 0 }, this.quadTree)

    if (hasMoved) {
      this.status = 'move'
    }
  }
  this.moveRight = () => {
    if (/jump|fall|action|hurt|rekt/.test(this.status) || this.vy !== 0) return
    this.direction = 'right'

    const hasMoved = moveObject(this, { x: this.walkingSpeed , y: 0}, this.quadTree)
    if (hasMoved) {
      this.status = 'move'
    }
  }
  this.jump = () => {
    if (/jump|fall|action|hurt|rekt/.test(this.status) || this.vy !== 0) return
    this.status = 'jump'
    this.frame = 0
    this.vx = this.direction === 'right' ? 6 : -6
    this.vy = -6
  }
  this.back = () => {
    if (/jump|fall|action|hurt|rekt/.test(this.status) || this.vy !== 0) return
    this.status = 'back'
  }
  this.action = () => {
    if (/jump|fall|action|hurt|rekt/.test(this.status)) return
    this.frame = 0
    this.status = 'action'
  }
  this.attack = () => {
    if (/jump|fall|action|hurt|rekt/.test(this.status)) return
    if (this.status !== 'attack') this.frame = 0
    this.status = 'attack'

    if (this.id === 'katoshi' && this.frame !== 3) return
    const enemies = this.senseEnemy()
    enemies.forEach((enemy, index) => {
      if (index > 2) return // can only hurt 3 enemies at once
      if (this.getCenter().x > enemy.getCenter().x) {
        this.direction = 'left'
      } else {
        this.direction = 'right'
      }
      enemy.hurt(this.strength, this.direction === 'left' ? 'right' : 'left')
    })
  }

  this.senseEnemy = () => {
    const boundingBox = this.getBoundingBox()
    return this.quadTree.query({
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h
    })
      .filter(enemy => enemy.enemy)
      .filter(enemy => intersects({
        x: this.direction === 'left' ? boundingBox.x - this.attackRange : boundingBox.x + boundingBox.w,
        y: boundingBox.y,
        w: this.attackRange,
        h: boundingBox.h
      }, enemy.getBoundingBox()))
  }


  this.hurt = (dmg, direction) => {
    if (/hurt|rekt/.test(this.status)) return
    this.dmgs.push({y: -8, dmg})
    this.health = Math.max(this.health - dmg, 0)
    this.status = 'hurt'
    this.vx = direction === 'left' ? 6 : -6
    this.vy = -3
    playSound('playerHurt')
    if (this.health <= 0) {
      this.health = 0
      this.die() // :(
    }
  }

  this.heal = heal => {
    if (/hurt|rekt/.test(this.status)) return
    this.heals.push({y: -8, heal})
    this.health = Math.min(this.health + heal, this.maxHealth)
  }

  this.die = () => {
    this.status = 'rekt'
    this.health = 0

    this.selected = false
    if (this.id === 'hodlonaut') {
      window.CTDLGAME.katoshi.select()
    } else {
      window.CTDLGAME.hodlonaut.select()
    }

    addTextToQueue(`${capitalize(this.id)} got rekt`)
  }

  this.senseControls = () => {
    let id = window.CTDLGAME.multiplayer ? this.id : 'hodlonaut'
    let didAction = window.KEYS.find(key => {
      if (!this[constants.CONTROLS[id][key]]) return false

      this[constants.CONTROLS[id][key]]()
      return true
    })

    if (this.selected) {
      didAction = didAction || window.BUTTONS.find(button => {
        if (!this[constants.CONTROLS.buttons[button.action]]) return false
  
        this[constants.CONTROLS.buttons[button.action]]()
        return true
      })
    }

    if (!didAction) this.idle()
  }

  this.autoPilot = () => {
    let action = 'idle'

    let enemies = this.quadTree.query({
      x: this.x - this.senseRadius,
      y: this.y - this.senseRadius,
      w: this.w + this.senseRadius,
      h: this.h + this.senseRadius
    })
      .filter(prey => prey.class === 'Shitcoiner' && prey.status !== 'rekt' && prey.status !== 'burning')
      .filter(prey => Math.abs(prey.getCenter().x - this.getCenter().x) <= this.senseRadius)

    let enemy = getClosest(this.getCenter(), enemies)
    if (enemy) {
      let attackRadius = this.getBoundingBox()
      attackRadius = {
        x: attackRadius.x - this.attackRange,
        y: attackRadius.y - this.attackRange,
        w: attackRadius.w + this.attackRange * 2,
        h: attackRadius.y + this.attackRange * 2,
      }
      if (intersects(attackRadius, enemy.getBoundingBox())) {
        if (this.getCenter().x > enemy.getCenter().x) {
          this.direction = 'left'
        } else {
          this.direction = 'right'
        }
        action = 'attack'
      } else if (this.getBoundingBox().x > enemy.getBoundingBox().x + enemy.getBoundingBox().w - 1) {
        action = 'moveLeft'
      } else if (enemy.getBoundingBox().x > this.getBoundingBox().x + this.getBoundingBox().w - 1) {
        action = 'moveRight'
      }
    }

    if (action === 'idle' && Math.random() < .01) {
      action = Math.random() < .5 ? 'moveLeft' : 'moveRight'
    }

    this[action]()
  }

  this.update = () => {
    const sprite = window.CTDLGAME.assets[this.id]

    if (window.CTDLGAME.lockCharacters) {
      let data = this.spriteData[this.direction][this.status][0]
      this.context.globalAlpha = data.opacity ?? 1

      this.context.drawImage(
        sprite,
        data.x, data.y, this.w, this.h,
        this.x, this.y, this.w, this.h
      )
      return
    }

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

      if (hasCollided) {
        this.vy = 0
      } else {
        if (!/jump|rekt|hurt/.test(this.status) && Math.abs(this.vy) > 4) this.status = 'fall'
      }
    }

    // collect touched items
    this.quadTree.query(this.getBoundingBox())
      .filter(obj => obj.class === 'Item' && !obj.collected && obj.vy === 0)
      .filter(item => intersects(this.getBoundingBox(), item.getBoundingBox()))
      .forEach(item => {
        if (item.id === 'pizza') this.heal(2)
        if (item.id === 'taco') this.heal(5)
        if (item.id === 'opendime') {
          let sats = Math.round(Math.random() * 10000)
          addTextToQueue(`You found an opendime with\nś${sats}`, () => {
            window.CTDLGAME.inventory.sats += sats
          })
        }
        if (item.id === 'coldcard') {
          let sats = Math.round(Math.random() * 100000)
          addTextToQueue(`You found a coldcard with\nś${sats}`, () => {
            window.CTDLGAME.inventory.sats += sats
          })
        }
        if (item.id === 'honeybadger') {
          addTextToQueue(`You gained the strength of the honey badger`, () => {
            this.stength += Math.round(Math.random() + 1)
            this.maxHealth += Math.round(Math.random() * 3 + 1)
            this.health = this.maxHealth
          })
        }
        item.collect()
      })
    
    if (this.status === 'fall' && this.vy === 0) this.status = 'idle'

    if (this.status === 'hurt' && this.vx === 0 && this.vy === 0) {
      this.status = 'idle'
    }

    if (window.CTDLGAME.multiplayer || this.selected) {
      this.senseControls()
    } else {
      this.autoPilot()
    }

    if (this.status !== 'idle' || Math.random() < .05) {
      this.frame++
    }

    if (this.frame >= this.spriteData[this.direction][this.status].length) {
      this.frame = 0
      if (/jump|action/.test(this.status)) this.status = 'idle'
    }

    let data = this.spriteData[this.direction][this.status][this.frame]
    this.w = data.w
    this.h = data.h
    this.context.globalAlpha = data.opacity ?? 1

    this.context.drawImage(
      sprite,
      data.x, data.y, this.w, this.h,
      this.x, this.y, this.w, this.h
    )

    this.context.globalAlpha = 1

    if (this.selected) {
      this.context.fillStyle = '#0F0'
      this.context.fillRect(
        this.x + this.w / 2, this.y - 2, 1, 1
      )
    }

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
    this.heals = this.heals
      .filter(heal => heal.y > -24)
      .map(heal => {
        write(this.context, `+${heal.heal}`, {
          x: this.getCenter().x - 2,
          y: this.y + heal.y,
          w: this.getBoundingBox().w
        }, 'left', false, 4, true, '#0F0')
        return {
          ...heal,
          y: heal.y - 1
        }
      })
  }

  this.select = () => {
    if (this.status === 'rekt') return
    this.selected = true
    window.SELECTEDCHARACTER = this
  }
  this.unselect = () => {
    this.selected = false
    window.SELECTEDCHARACTER = null
  }

  this.getBoundingBox = () => this.status !== 'rekt'
  ? ({
      id: this.id,
      x: this.x + 5,
      y: this.y + 3,
      w: this.w - 10,
      h: this.h - 4
    })
  : ({
      id: this.id,
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h
    })

  this.getCenter = () => ({
    x: this.x + this.w / 2,
    y: this.y + this.h / 2
  })

  this.toJSON = () => ({
    id: this.id,
    class: this.class,
    health: this.health,
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