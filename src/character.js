import hodlonaut from './sprites/hodlonaut'
import katoshi from './sprites/katoshi'
import { CTDLGAME } from './gameUtils'
import { moveObject, intersects, getClosest } from './geometryUtils'
import { capitalize } from './stringUtils'
import { write } from './font';
import constants from './constants'
import { addTextToQueue } from './textUtils';
import { playSound } from './sounds';

const sprites = {
  hodlonaut,
  katoshi
}

export default function(id, options) {
  this.id = id;
  this.class = 'Character'
  this.applyGravity = true
  this.spriteData = sprites[id]
  this.maxHealth = options.maxHealth ?? 21
  this.health = options.health ?? 21
  this.dmgs = []
  this.heals = []
  this.says = []
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
  this.follow = options.follow ?? true
  this.status = options.status || 'idle'
  this.attacks = false
  this.direction = options.direction || 'right'
  this.frame = options.frame || 0
  this.walkingSpeed = options.walkingSpeed || 3
  this.teleporting = 0

  this.idle = () => {
    if (/jump|fall|action|hurt|rekt/.test(this.status)) return
    this.status = 'idle'
  }
  this.moveLeft = () => {
    if (/jump|fall|action|hurt|rekt/.test(this.status)|| this.vy !== 0) return
    this.direction = 'left'
    const hasMoved =  moveObject(this, { x: -this.walkingSpeed, y: 0 }, CTDLGAME.quadTree)

    if (hasMoved) {
      this.status = this.attacks ? 'moveAttack' : 'move'
      if (!this.attacks) return
      if (this.id === 'katoshi' && this.frame !== 3) return
      this.makeDamage(this.id === 'katoshi' ? .8 : 1)
    } else if (!CTDLGAME.multiPlayer && !this.selected) {
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
    if (/jump|fall|action|hurt|rekt/.test(this.status) || this.vy !== 0) return
    this.direction = 'right'

    const hasMoved = moveObject(this, { x: this.walkingSpeed , y: 0}, CTDLGAME.quadTree)
    if (hasMoved) {
      this.status = this.attacks ? 'moveAttack' : 'move'
      if (!this.attacks) return
      if (this.id === 'katoshi' && this.frame !== 3) return
      this.makeDamage(this.id === 'katoshi' ? .8 : 1)
    } else if (!CTDLGAME.multiPlayer && !this.selected) {
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
    if (/jump|fall|action|hurt|rekt/.test(this.status) || this.vy !== 0) return
    this.status = 'jump'
    this.frame = 0
    this.vx = this.direction === 'right' ? 6 : -6
    this.vy = -6
  }
  this.back = () => {
    if (/jump|fall|action|hurt|rekt/.test(this.status) || this.vy !== 0) return
    this.status = 'back'

    const boundingBox = this.getBoundingBox()
    const eventObject =  CTDLGAME.quadTree.query(boundingBox)
      .filter(obj => obj.backEvent)
      .find(obj => intersects(boundingBox, obj.getBoundingBox()))

    if (!eventObject) return
    eventObject.backEvent(this)
  }
  this.action = () => {
    if (/jump|fall|action|hurt|rekt/.test(this.status)) return
    this.frame = 0
    this.status = 'action'
  }
  this.triggerAttack = () => {
    if (/jump|fall|action|hurt|rekt/.test(this.status)) return
    this.status = 'attack'
    this.attacks = true
  }
  this.attack = () => {
    if (/jump|fall|action|hurt|rekt/.test(this.status)) return
    if (!/attack/i.test(this.status)) this.frame = 0
    this.status = 'attack'

    if (this.id === 'katoshi' && this.frame !== 3) return
    this.makeDamage(1)
  }

  this.makeDamage = multiplier => {
    // TODO make lightningTorch stronger with increasing sats count
    if (this.id === 'hodlonaut') playSound('lightningTorch')
    if (this.id === 'katoshi') playSound('sword')

    const enemies = this.senseEnemy()
    enemies.forEach((enemy, index) => {
      if (index > 2) return // can only hurt 3 enemies at once
      let dmg = Math.round(this.strength * (1 + Math.random() / 4))
      if (this.getCenter().x > enemy.getCenter().x) {
        this.direction = 'left'
      } else {
        this.direction = 'right'
      }
      enemy.hurt(Math.round(dmg * multiplier), this.direction === 'left' ? 'right' : 'left')
    })
  }

  this.senseEnemy = () => {
    const boundingBox = this.getBoundingBox()
    return CTDLGAME.quadTree.query({
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
    if (/hurt|rekt/.test(this.status) || this.teleporting > 0) return
    const lostFullPoint = Math.floor(this.health) - Math.floor(this.health - dmg) > 0
    this.health = Math.max(this.health - dmg, 0)

    if (!lostFullPoint) return

    this.dmgs.push({y: -8, dmg: Math.ceil(dmg)})
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
      CTDLGAME.katoshi.choose()
    } else {
      CTDLGAME.hodlonaut.choose()
    }

    addTextToQueue(`${capitalize(this.id)} got rekt`)
  }

  this.senseControls = () => {
    let id = CTDLGAME.multiPlayer ? this.id : 'singlePlayer'
    this.attacks = false

    let didAction = false
    Object.keys(constants.CONTROLS[id]).find(key => {
      if (window.KEYS.indexOf(key) === -1) return false

      this[constants.CONTROLS[id][key]]()
      didAction = true

      if (constants.CONTROLS[id][key] === 'triggerAttack') return false
      return true
    })

    if (this.selected) {
      Object.keys(constants.CONTROLS.buttons).find(key => {
        let action = constants.CONTROLS.buttons[key]

        if (!window.BUTTONS.some(button => button.action === key)) return false

        this[action]()
        didAction = true

        if (action === 'triggerAttack') return false
        return true
      })
    }

    if (this.attacks && this.status !== 'moveAttack') this.attack()
    if (!didAction) this.idle()
  }

  this.autoPilot = () => {
    let action = 'idle'
    this.attacks = false

    let enemies = CTDLGAME.quadTree.query({
      x: this.x - this.senseRadius,
      y: this.y - this.senseRadius,
      w: this.w + this.senseRadius,
      h: this.h + this.senseRadius
    })
      .filter(prey => prey.enemy && prey.status !== 'rekt' && prey.status !== 'burning')
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
    } else if (this.follow) {
      let friends = [window.SELECTEDCHARACTER]
        .filter(friend => friend.class === 'Character' && friend.status !== 'rekt')
        .filter(friend => friend.id !== this.id)
        .filter(friend => Math.abs(friend.getCenter().x - this.getCenter().x) <= this.senseRadius)

      let friend = getClosest(this.getCenter(), friends)
      if (friend) {
        if (this.getBoundingBox().x > friend.getBoundingBox().x + friend.getBoundingBox().w + 10) {
          action = 'moveLeft'
        } else if (friend.getBoundingBox().x > this.getBoundingBox().x + this.getBoundingBox().w + 10) {
          action = 'moveRight'
        }
      }
    }

    if (action === 'idle' && Math.random() < .01) {
      action = Math.random() < .5 ? 'moveLeft' : 'moveRight'
    }

    this[action]()
  }

  this.update = () => {
    const sprite = CTDLGAME.assets[this.id]

    if (CTDLGAME.lockCharacters) {
      let data = this.spriteData[this.direction][this.status][0]
      constants.charContext.globalAlpha = data.opacity ?? 1

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

    if (this.vy !== 0 && this.inViewport) {
      if (this.vy > 12) this.vy = 12
      if (this.vy < -12) this.vy = -12
      const hasCollided = !moveObject(this, { x: 0 , y: this.vy }, CTDLGAME.quadTree)

      if (hasCollided) {
        this.vy = 0
      } else if (!/jump|rekt|hurt/.test(this.status) && Math.abs(this.vy) > 4) {
        this.status = 'fall'
      }
    }

    const boundingBox = this.getBoundingBox()

    // collect touched items
    CTDLGAME.quadTree.query(boundingBox)
      .filter(obj => obj.touch)
      .filter(obj => intersects(boundingBox, obj.getBoundingBox()))
      .forEach(obj => {
        obj.touch(this)
      })
    
    if (this.status === 'fall' && this.vy === 0) this.status = 'idle'

    if (this.status === 'hurt' && this.vx === 0 && this.vy === 0) {
      this.status = 'idle'
    }

    if (CTDLGAME.multiPlayer || this.selected) {
      this.senseControls()
    } else {
      this.autoPilot()
    }

    // find out if eventObject has been touched
    const eventObject =  CTDLGAME.quadTree.query(boundingBox)
      .filter(obj => obj.touchEvent)
      .find(obj => intersects(boundingBox, obj.getBoundingBox()))

    if (eventObject) eventObject.touchEvent(this)

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
    constants.charContext.globalAlpha = data.opacity ?? 1
    if (this.teleporting > 0) {
      this.teleporting--
      constants.charContext.globalAlpha = this.teleporting % 2
    }

    constants.charContext.drawImage(
      sprite,
      data.x, data.y, this.w, this.h,
      this.x, this.y, this.w, this.h
    )

    constants.charContext.globalAlpha = 1

    if (this.selected) {
      constants.charContext.fillStyle = '#0F0'
      constants.charContext.fillRect(
        this.x + this.w / 2, this.y - 2, 1, 1
      )
    }

    this.dmgs = this.dmgs
      .filter(dmg => dmg.y > -24)
      .map(dmg => {
        write(constants.charContext, `-${dmg.dmg}`, {
          x: this.getCenter().x - 4,
          y: this.y + dmg.y,
          w: 8
        }, 'left', false, 4, true, '#F00')
        return {
          ...dmg,
          y: dmg.y - 1
        }
      })
    this.heals = this.heals
      .filter(heal => heal.y > -24)
      .map(heal => {
        write(constants.charContext, `+${heal.heal}`, {
          x: this.getCenter().x - 4,
          y: this.y + heal.y,
          w: 8
        }, 'left', false, 4, true, '#0F0')
        return {
          ...heal,
          y: heal.y - 1
        }
      })
    this.says = this.says
      .filter(say => say.y > -24)
      .map(say => {
        write(constants.charContext, say.say, {
          x: this.getCenter().x - 12,
          y: this.y + say.y,
          w: 24
        }, 'left', false, 4, false, '#FFF')
        return {
          ...say,
          y: say.y - 1
        }
      })
  }

  this.say = say => {
    this.says = [{y: -8, say}]
  }

  this.select = () => {
    if (this.selected || CTDLGAME.multiPlayer || this.status === 'rekt') return
    this.follow = !this.follow
    window.SELECTEDCHARACTER.say(this.follow ? 'come' : 'wait')
  }

  this.choose = () => {
    if (this.status === 'rekt') return
    if (window.SELECTEDCHARACTER) window.SELECTEDCHARACTER.unselect()
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
        h: this.h - 3
      })
    : ({
        id: this.id,
        x: this.x,
        y: this.y,
        w: this.w,
        h: this.h
      })

  this.getAnchor = () => this.status !== 'rekt'
    ? ({
        x: this.getBoundingBox().x + 2,
        y: this.getBoundingBox().y + this.getBoundingBox().h - 1,
        w: this.getBoundingBox().w - 5,
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
    walkingSpeed: this.walkingSpeed,
    follow: this.follow
  })
}