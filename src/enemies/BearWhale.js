import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

import bearWhale from '../sprites/bearWhale'
import { addHook, CTDLGAME } from '../gameUtils'
import { intersects, getClosest, moveObject } from '../geometryUtils'
import constants from '../constants'
import { addTextToQueue, setTextQueue } from '../textUtils';
import { playSound } from '../sounds';
import Agent from '../Agent'
import { random } from '../arrayUtils'
import { skipCutSceneButton } from '../events'
import { getSoundtrack, initSoundtrack } from '../soundtrack'
import Item from '../Item'


const isEmerged = new Task({
  run: agent => agent.status !== 'spawn' && agent.y > agent.ferry.y + agent.ferry.getBoundingBox().h ? SUCCESS : FAILURE
})
const emerge = new Task({
  run: agent => agent.spawn.condition() ? agent.spawn.effect() : FAILURE
})
const dive = new Task({
  run: agent => agent.dive.condition() ? agent.dive.effect() : FAILURE
})

// Sequence: runs each node until fail
const attackEnemy = new Sequence({
  nodes: [
    'touchesEnemy',
    'attack'
  ]
})

// Sequence: runs each node until fail
const attack2Enemy = new Sequence({
  nodes: [
    'attack2'
  ]
})

// Sequence: runs each node until fail
const attack3Enemy = new Sequence({
  nodes: [
    'touchesEnemy',
    'attack3'
  ]
})

const tree = new Selector({
  nodes: [
    dive,
    emerge,
    attackEnemy,
    attack2Enemy,
    attack3Enemy,
    'idle'
  ]
})


class BearWhale extends Agent {
  constructor(id, options) {
    super(id, options)
    this.spriteData = bearWhale
    this.status = options.status || 'swim'
    this.maxHealth = 3940
    this.dmgToChangeStrategy = options.dmgToChangeStrategy || Math.round(Math.random() * 200)
    this.strategy = options.strategy || 'attack1'
    this.currentStrategy = options.currentStrategy || 'attack1'
    this.health = options.health ?? 3940
    this.usd = options.usd || Math.round(9000000)
    this.item = { id: 'honeybadger' }
    this.context = 'fgContext'
    this.strength = 10
    this.enemy = options.enemy
    this.attackRange = 4
    this.senseRadius = 500
    this.protection = 0
    this.hadIntro = options.hadIntro || false
    this.canMove = options.hadIntro || false
    this.walkingSpeed = 2
  }

  applyGravity = false
  boss = true
  w = 75
  h = 90

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  idle = {
    condition: () => !/attack2/.test(this.currentStrategy),
    effect: () => {
      this.status = 'idle'
      return SUCCESS
    }
  }
  spawn = {
    condition: () => /swim|spawn/.test(this.status) && /attack1|attack3/.test(this.currentStrategy),
    effect: (side = 'right') => {
      if (this.status !== 'spawn') {
        this.status = 'spawn'
        this.frame = 0
      }

      if (this.frame === 0) {
        this.direction = side === 'right' ? 'left' : 'right'
        // move bearwhale in front of ferry
        if (side === 'right') {
          this.x = this.ferry.x + this.ferry.getBoundingBox().w - 18
        } else {
          this.x = this.ferry.x - 50
        }
        this.y = this.ferry.y + this.ferry.getBoundingBox().h + 50
        playSound('longNoise')
      } else if (this.frame === 4) {
        this.idle.effect()
        return SUCCESS
      } else {
        this.y -= 21
      }

      if (this.status === 'spawn') return SUCCESS

      this.status = 'spawn'

      return SUCCESS
    }
  }
  dive = {
    condition: () => this.currentStrategy !== this.strategy,
    effect: () => {
      if (this.status !== 'dive') this.frame = 0

      this.status = 'dive'
      if (this.frame === 3) {
        playSound('longNoise')
      } else if (this.frame === 4) {
        this.currentStrategy = this.strategy
        this.status = 'swim'
        return SUCCESS
      } else {
        this.y += 21
      }

      if (this.status === 'dive') return SUCCESS

      this.frame = 0
      this.status = 'dive'

      return SUCCESS
    }
  }
  moveLeft = {
    condition: () => true,
    effect: () => {
      this.direction = 'left'
      this.isMoving = 'left'

      this.status = 'move'
      this.x--
      if (this.frame >= 19) {
        this.frame = 19
        this.y += 3
      }
      return SUCCESS
    }
  }
  moveRight = {
    condition: () => true,
    effect: () => {
      this.direction = 'right'
      this.isMoving = 'right'

      this.status = 'move'
      this.x++
      if (this.frame >= 19) {
        this.frame = 19
        this.y += 3
      }
        return SUCCESS

    }
  }
  attack = {
    condition: () => {
      if (!this.closestEnemy || this.currentStrategy !== 'attack1') return false
      const attackBox = {
        x: this.getBoundingBox().x - this.attackRange,
        y: this.getBoundingBox().y,
        w: this.getBoundingBox().w + this.attackRange * 2,
        h: this.getBoundingBox().h
      }
      return intersects(attackBox, this.closestEnemy.getBoundingBox())
    },
    effect: () => {
      if (this.status === 'attack' && this.frame === 6) {
        this.closestEnemy.hurt(this.strength, this.direction === 'left' ? 'right' : 'left', this)
        return SUCCESS
      }
      if (this.status === 'attack') return SUCCESS

      this.frame = 0
      this.status = 'attack'

      return SUCCESS
    }
  }
  attack2 = {
    condition: () => this.currentStrategy === 'attack2',
    effect: () => {
      const water = this.ferry.y + this.ferry.getBoundingBox().h

      if (this.status !== 'attack2') {
        // let bearwhale jump out of the water
        this.frame = 0
        this.x = window.SELECTEDCHARACTER.x + 120
        this.y = water
        this.vy = -12
        this.vx = -16
        this.applyGravity = true
        playSound('longNoise')
      }
      if (this.y > water && this.y < water + 14) {
        playSound('longNoise')
      }
      if (this.y > CTDLGAME.world.h) {
        this.applyGravity = false
        this.strategy = 'attack1'
        this.currentStrategy = 'attack1'
        this.vy = 0
        this.vx = 0
        return this.spawn.effect('left')
      }

      if (this.status === 'attack2') return SUCCESS

      this.status = 'attack2'

      return SUCCESS
    }
  }
  attack3 = {
    condition: () => {
      if (!this.closestEnemy || this.currentStrategy !== 'attack3') return false
      const attackBox = {
        x: this.getBoundingBox().x - this.attackRange,
        y: this.getBoundingBox().y,
        w: this.getBoundingBox().w + this.attackRange * 2,
        h: this.getBoundingBox().h
      }
      return intersects(attackBox, this.closestEnemy.getBoundingBox())
    },
    effect: () => {
      if (this.status === 'attack' && this.frame === 6) {
        this.closestEnemy.hurt(this.strength, this.direction === 'left' ? 'right' : 'left', this)
        return SUCCESS
      }
      if (this.status === 'attack') return SUCCESS

      this.frame = 0
      this.status = 'attack'

      return SUCCESS
    }
  }

  onHurt = () => {
    playSound('creatureHurt')
  }

  hurtCondition = (dmg, direction) => !/attack2|dive|swim|spawn|hurt|rekt|dive/.test(this.status) && !this.protection
  hurt = (dmg, direction, agent) => {
    if (!this.hurtCondition(dmg, direction)) return
    this.dmgs.push({y: -8, dmg})
    this.health = Math.max(this.health - dmg, 0)

    this.dmgToChangeStrategy -= dmg
    if (Math.random() < .05) this.status = 'hurt'

    this.protection = 2
    if (this.health <= 0) {
      this.health = 0
      return this.die(agent)
    }

    return this.onHurt(agent)
  }

  die = () => {
    this.status = 'hurt'
    this.frame = 0
    this.canMove = false

    playSound('creatureHurt')
    addHook(CTDLGAME.frame + 8, () => playSound('creatureHurt'))
    addHook(CTDLGAME.frame + 16, () => playSound('creatureHurt'))
    addHook(CTDLGAME.frame + 24, () => {
      playSound('creatureHurt')
      initSoundtrack('epiphin')
      this.status = 'rekt'
    })
    if (this.usd) CTDLGAME.inventory.usd += this.usd
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

    addTextToQueue(`${this.getClass()} got rekt,\nyou found $${this.usd}`)
  }

  applyPhysics = () => {
    if ((this.vx !== 0 || this.vy !== 0) && this.inViewport) {
      this.x += this.vx
      this.y += this.vy

      if (this.vx < 0) this.vx += 1
      if (this.vx > 0) this.vx -= 1
    }
  }

  update = () => {
    if (!this.sprite) this.sprite = CTDLGAME.assets.bearWhale
    if (!this.ferry) this.ferry = CTDLGAME.objects.find(obj => obj.id === 'ferry')
    if (CTDLGAME.lockCharacters) {
      this.frame++
      this.draw()
      return
    }

    this.applyGravity = this.status === 'attack2'
    this.swims = this.status === 'swim'
    this.applyPhysics()
    if (this.status === 'hurt' && this.canMove && this.vx === 0 && this.vy === 0) {
      this.status = 'idle'
    }

    console.log(this.dmgToChangeStrategy, this.currentStrategy, this.strategy, this.status, this.x, this.y)
    if (this.dmgToChangeStrategy < 0) {
      this.dmgToChangeStrategy = Math.round(Math.random() * 100)
      this.strategy = Math.random() < .33
        ? 'attack1'
        : Math.random() < .5
        ? 'attack2'
        : 'attack3'
    }

    const senseBox = this.getSenseBox()
    this.sensedObjects = CTDLGAME.quadTree.query(senseBox)
    const ferry = this.sensedObjects.find(obj => obj.id = 'ferry')

    if (window.DRAWSENSORS) {
      constants.charContext.beginPath()
      constants.charContext.rect(senseBox.x, senseBox.y, senseBox.w, senseBox.h)
      constants.charContext.stroke()
    }

    this.sensedEnemies = this.sensedObjects
      .filter(enemy => enemy.getClass() === 'Character' && enemy.health > 0)
      .filter(enemy => Math.abs(enemy.getCenter().x - this.getCenter().x) <= this.senseRadius)

    if (!this.hadIntro && ferry && this.x - ferry.x < 130 && this.x - ferry.x > 0 && this.status !== 'spawn') {
      if (this.x - ferry.x >= 128) {
        playSound('longNoise')
        addTextToQueue('nakadai.MONARCH:\nIt\'s J0E007, the big bear\nwhale! We might see strong volatility ahead.')
        addTextToQueue('nakadai.MONARCH:\nYou have to brace yourself and HODL no matter what, if you want to survive.')
      }
      this.moveLeft.effect()
    } else if (!this.hadIntro && ferry && (this.x - ferry.x < 0 || this.status === 'spawn')) {
      this.status = 'spawn'
      if (this.frame === 4) {
        ferry.stop(true)
        playSound('elevatorStop')
        CTDLGAME.lockCharacters = true
        skipCutSceneButton.active = true
        if (getSoundtrack() !== 'bearWhalesTheme') initSoundtrack('bearWhalesTheme')
  
        addTextToQueue('nakadai.MONARCH:\nThe sword is the soul. Study the soul to know the sword. Evil mind, evil sword.')
        addTextToQueue('*nakadai.MONARCH joins the battle*', () => {
          CTDLGAME.nakadaiMonarch = CTDLGAME.objects.find(obj => obj.id === 'nakadai_mon')
          CTDLGAME.nakadaiMonarch.follow = true
          CTDLGAME.bossFight = true
          CTDLGAME.lockCharacters = false
          skipCutSceneButton.active = false
          this.enemy = true
          this.canMove = true
        })
        this.hadIntro = true
      }
    }

    this.sensedFriends = []

    if (this.status === 'spawn') this.spawn.effect(this.direction === 'right' ? 'left' : 'right')
    if (this.status === 'dive') this.dive.effect()
    if (this.status === 'attack2') this.attack2.effect()

    if (Math.abs(this.vy) < 3 && this.canMove && !/attack2|spawn|dive|fall|rekt|hurt/.test(this.status)) {
      if (getSoundtrack() !== 'bearWhalesTheme') {
        ferry.stop(true)
        // TODO make this loading from savestate
        CTDLGAME.nakadaiMonarch = CTDLGAME.objects.find(obj => obj.id === 'nakadai_mon')
        CTDLGAME.nakadaiMonarch.follow = true
        initSoundtrack('bearWhalesTheme')
      }

      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.closestFriend = getClosest(this, this.sensedFriends)
      this.bTree.step()
    }

    if (this.exhaustion) this.exhaustion--
    if (this.status !== 'idle' || Math.random() < .05) {
      this.frame++
    }

    this.draw()
  }

  thingsToSay = []

  select = () => {
    if (this.talks) return
    this.talks = true

    let whatToSay = random(this.thingsToSay)
    whatToSay.map((text, index) => {
      if (index === whatToSay.length - 1) {
        addTextToQueue(text, () => {
          this.talks = false
        })
      } else {
        addTextToQueue(text)
      }
    })
  }

  // TODO check this
  getBoundingBox = () => this.status !== 'rekt'
    ? ({ // normal
        id: this.id,
        x: this.x + 6,
        y: this.y + 6,
        w: this.w - 12,
        h: this.h - 6
      })
    : ({ // rekt
      id: this.id,
      x: this.x,
      y: this.y + 25,
      w: this.w,
      h: this.h - 25
    })

  getAnchor = () => this.status !== 'rekt'
    ? ({
        x: this.getBoundingBox().x + 2,
        y: this.getBoundingBox().y + this.getBoundingBox().h - 1,
        w: this.getBoundingBox().w - 4,
        h: 1
    })
    : ({
      x: this.getBoundingBox().x,
      y: this.getBoundingBox().y + this.getBoundingBox().h - 1,
      w: this.getBoundingBox().w,
      h: 1
  })
}
export default BearWhale