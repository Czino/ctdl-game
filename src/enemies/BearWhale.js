import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

import bearWhale from '../sprites/bearWhale'
import { addHook, CTDLGAME } from '../gameUtils'
import { intersects, getClosest } from '../geometryUtils'
import { playSound } from '../sounds'
import Agent from '../Agent'
import { random } from '../arrayUtils'
import { skipCutSceneButton } from '../events'
import { getSoundtrack, initSoundtrack } from '../soundtrack'
import Item from '../objects/Item'
import Wave from '../objects/Wave'
import { addTextToQueue } from '../textUtils'

const emerge = new Task({
  run: agent => agent.spawn.condition() ? agent.spawn.effect(agent.health <= 1 ? 'right' : null) : FAILURE
})
const dive = new Task({
  run: agent => agent.dive.condition() ? agent.dive.effect() : FAILURE
})

// Sequence: runs each node until fail
const attackEnemy = new Sequence({
  nodes: [
    'canAttackEnemy',
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
    'canAttackEnemy',
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
    this.stayUnderWaterCounter = options.stayUnderWaterCounter || 0
    this.attackCounter = options.attackCounter || 0
    this.strategy = options.strategy || 'attack1'
    this.currentStrategy = options.currentStrategy || 'attack1'
    this.health = options.health ?? 8 * 300
    this.usd = options.usd || Math.round(34410 * 300)
    this.item = [
      { id: 'honeybadger' },
      { id: 'honeybadger' },
      { id: 'phoenix' }
    ]
    this.context = options.context || 'fgContext'
    this.strength = 8
    this.enemy = options.enemy
    this.attackRange = 6
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
    condition: () => !/attack2/i.test(this.currentStrategy),
    effect: () => {
      this.status = this.currentStrategy === 'attack3' ? 'attack3Idle' : 'idle'
      return SUCCESS
    }
  }
  spawn = {
    condition: () => /swim|spawn/i.test(this.status) && /attack1|attack3/i.test(this.currentStrategy),
    effect: side => {
      if (!/spawn/i.test(this.status)) {
        this.frame = 0
      }

      if (this.frame === 0) {
        if (side) this.direction = side === 'right' ? 'left' : 'right'
        // move bearwhale in front of ferry
        if (this.currentStrategy === 'attack3') {
          this.x = window.SELECTEDCHARACTER.x - 25
          this.context = 'bgContext'
          this.status = 'attack3Spawn'
        } else if (this.direction === 'left') {
          this.x = this.ferry.x + this.ferry.getBoundingBox().w - 18
          this.context = 'fgContext'
          this.status = 'spawn'
        } else {
          this.x = this.ferry.x - 50
          this.context = 'fgContext'
          this.status = 'spawn'
        }
        this.y = this.ferry.y + this.ferry.getBoundingBox().h + 50
        playSound('longNoise')
      } else if (this.frame === 4) {
        this.idle.effect()
        return SUCCESS
      } else {
        this.y -= 21
      }

      return SUCCESS
    }
  }
  dive = {
    condition: () => this.currentStrategy !== this.strategy,
    effect: () => {
      if (!/dive/i.test(this.status)) {
        this.frame = 0
        this.status = this.currentStrategy === 'attack3' ? 'attack3Dive' : 'dive'
      }

      if (this.frame === 3) {
        playSound('longNoise')
      } else if (this.frame === 4) {
        this.currentStrategy = this.strategy
        this.status = 'swim'
        this.direction = Math.random() < .5 ? 'left' : 'right'
        this.stayUnderWaterCounter = 10 + Math.round(Math.random() * 20)
        return SUCCESS
      } else {
        this.y += 21
      }


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
      if (!this.closestEnemy || this.currentStrategy !== 'attack1' || this.attackCounter > 0) return false
      const attackBox = {
        x: this.getBoundingBox().x - this.attackRange,
        y: this.getBoundingBox().y,
        w: this.getBoundingBox().w + this.attackRange * 2,
        h: this.getBoundingBox().h
      }
      return intersects(attackBox, this.closestEnemy.getBoundingBox())
    },
    effect: () => {
      const attackBox = {
        x: this.getBoundingBox().x - this.attackRange,
        y: this.getBoundingBox().y,
        w: this.getBoundingBox().w + this.attackRange * 2,
        h: this.getBoundingBox().h
      }
      if (this.status === 'attack' && this.frame === 6) {
        this.closestEnemy.hurt(this.strength, this.direction === 'left' ? 'right' : 'left', this)
        this.sensedEnemies
          .filter(enemy => enemy.id !== this.closestEnemy.id && Math.random() < .5 && intersects(attackBox, enemy.getBoundingBox()))
          .forEach(enemy => enemy.hurt(this.strength, this.direction === 'left' ? 'right' : 'left', this))
        this.attackCounter = 6
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
        this.context = 'fgContext'
        playSound('longNoise')
      }
      if (this.y > water && this.y < water + 15) {
        playSound('longNoise')
        CTDLGAME.objects.push(new Wave(
          'wave',
          {
            x: this.x,
            y: water,
            vx: -16,
            vy: -6
          }
        ))
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
      if (!this.closestEnemy || this.currentStrategy !== 'attack3' || this.attackCounter > 0) return false
      const attackBox = {
        x: this.getBoundingBox().x - this.attackRange * 2,
        y: this.getBoundingBox().y,
        w: this.getBoundingBox().w + this.attackRange * 4,
        h: this.getBoundingBox().h
      }
      return intersects(attackBox, this.closestEnemy.getBoundingBox())
    },
    effect: () => {
      const boundingBox = this.getBoundingBox()
      const attackBoxLeft = {
        x: boundingBox.x - this.attackRange * 2,
        y: boundingBox.y,
        w: boundingBox.w / 2 + this.attackRange * 2,
        h: boundingBox.h
      }
      const attackBoxRight = {
        x: boundingBox.x + boundingBox.w / 2,
        y: boundingBox.y,
        w: boundingBox.w / 2 + this.attackRange * 2,
        h: boundingBox.h
      }
      if (!/attack3Left|attack3Right/i.test(this.status)) {
        const canAttackLeft = this.sensedEnemies.some(enemy => intersects(attackBoxLeft, enemy))
        const canAttackRight = this.sensedEnemies.some(enemy => intersects(attackBoxRight, enemy))
        if (canAttackLeft && canAttackRight) {
          this.status = Math.random() < .5 ? 'attack3Left' : 'attack3Right'
        } else {
          this.status = canAttackLeft ?
            'attack3Left'
            : intersects(attackBoxRight, this.closestEnemy)
            ? 'attack3Right'
            : 'attack3Idle'
        }
      }
      if (this.status === 'attack3Left' && this.frame === 6) {
        this.closestEnemy.hurt(this.strength, 'left', this)
        this.sensedEnemies
          .filter(enemy => enemy.id !== this.closestEnemy.id && Math.random() < .5 && intersects(attackBoxLeft, enemy.getBoundingBox()))
          .forEach(enemy => enemy.hurt(this.strength, 'left', this))
        this.attackCounter = 6
        return SUCCESS
      }
      if (this.status === 'attack3Right' && this.frame === 6) {
        this.closestEnemy.hurt(this.strength, 'right', this)
        this.sensedEnemies
          .filter(enemy => enemy.id !== this.closestEnemy.id && Math.random() < .5 && intersects(attackBoxRight, enemy.getBoundingBox()))
          .forEach(enemy => enemy.hurt(this.strength, 'right', this))
        this.attackCounter = 6
        return SUCCESS
      }
      if (/attack3Left|attack3Right/i.test(this.status)) return SUCCESS

      this.frame = 0
      return SUCCESS
    }
  }

  onHurt = () => {
    playSound('creatureHurt')
    if (Math.random() < .1) playSound('bearGrowl')
  }

  hurtCondition = () => !/dive|swim|spawn|hurt|rekt/i.test(this.status) && !this.protection
  hurt = (dmg, direction, agent) => {
    if (!this.hurtCondition(dmg, direction)) return
    this.dmgs.push({
      x: Math.round((Math.random() - .5) * 16),
      y: -8,
      dmg: Math.ceil(dmg)
    })
    this.health = Math.max(this.health - dmg, 0)

    this.dmgToChangeStrategy -= dmg
    if (Math.random() < .05 && this.status !== 'attack2') this.status = 'hurt'

    this.protection = 2
    if (this.health <= 0) {
      this.health = 0
      return this.die(agent)
    }

    return this.onHurt(agent)
  }

  die = () => {
    this.health = 1
    if (this.status === 'attack2') return
    if (this.direction !== 'left' || /attack3/.test(this.status)) {
      this.strategy = 'attack1'
      return this.dive.effect()
    }

    this.health = 0
    const ferry = this.sensedObjects.find(obj => obj.id = 'ferry')
    this.status = 'rekt'
    this.frame = 0
    this.canMove = false
    this.applyGravity = true

    playSound('creatureHurt')
    addHook(CTDLGAME.frame + 16, () => playSound('creatureHurt'))
    addHook(CTDLGAME.frame + 32, () => playSound('creatureHurt'))
    addHook(CTDLGAME.frame + 48, () => {
      initSoundtrack('surferJim')
      if (this.usd) CTDLGAME.inventory.usd += this.usd
  
      this.item.forEach((item, index) => {
        CTDLGAME.objects.push(new Item(
          item.id,
          {
            x: ferry.x + 40 + index * 20,
            y: ferry.y,
            vy: -8,
            vx: 0
          }
        ))
      })

      addTextToQueue(`${this.getClass()} got rekt,\nyou found $${this.usd}`)
      addTextToQueue('nakadai.MONARCH:\nWow, what a beast! I can\'t wait to tell the others at\nthe citadel.', () => {
        ferry.drive(3)
      })
    })
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
    if (this.status === 'hurt' && this.canMove && this.vx === 0 && this.vy === 0) this.status = 'idle'

    this.dmgToChangeStrategy--
    if (this.dmgToChangeStrategy < 0) {
      this.dmgToChangeStrategy = 80 + Math.round(Math.random() * 100)
      this.strategy = Math.random() < .33
        ? 'attack1'
        : Math.random() < .5
        ? 'attack2'
        : 'attack3'
    }

    const senseBox = this.getSenseBox()
    this.sensedObjects = CTDLGAME.quadTree.query(senseBox)
    const ferry = this.sensedObjects.find(obj => obj.id = 'ferry')

    this.sensedEnemies = this.sensedObjects
      .filter(enemy => /Character|NakadaiMonarch/i.test(enemy.getClass()) && enemy.health > 0)
      .filter(enemy => Math.abs(enemy.getCenter().x - this.getCenter().x) <= this.senseRadius)

    if (!this.hadIntro && ferry && this.x - ferry.x < 130 && this.x - ferry.x > 0 && this.status !== 'spawn') {
      if (this.x - ferry.x >= 128) {
        playSound('longNoise')
        addTextToQueue('nakadai.MONARCH:\nIt\'s the big bear\nwhale! We might see strong volatility ahead.')
        addTextToQueue('nakadai.MONARCH:\nYou have to brace yourself and HODL no matter what, if you want to survive.')
      }
      this.moveLeft.effect()
    } else if (!this.hadIntro && ferry && (this.x - ferry.x < 0 || this.status === 'spawn')) {
      this.spawn.effect('right')
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


    if (this.attackCounter > 0) this.attackCounter--
    if (this.stayUnderWaterCounter > 0) this.stayUnderWaterCounter--
    if (this.stayUnderWaterCounter === 6) playSound('bearGrowl')
    if (this.canMove && this.stayUnderWaterCounter === 0 && !/fall|rekt|hurt/i.test(this.status)) {
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

  getBoundingBox = () => this.direction === 'left'
    ? ({
        id: this.id,
        x: this.x,
        y: this.y,
        w: this.w - 6,
        h: this.h
      })
    : ({
      id: this.id,
      x: this.x + 6,
      y: this.y,
      w: this.w - 6,
      h: this.h
    })
}
export default BearWhale