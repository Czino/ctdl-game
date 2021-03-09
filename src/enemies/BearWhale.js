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
    'touchesEnemy',
    'attack2'
  ]
})

const tree = new Selector({
  nodes: [
    attackEnemy,
    attack2Enemy,
    'moveToPointX',
    'idle'
  ]
})


class BearWhale extends Agent {
  constructor(id, options) {
    super(id, options)
    this.spriteData = bearWhale
    this.status = options.status || 'swim'
    this.maxHealth = 394
    this.health = options.health ?? 394
    this.usd = options.usd || Math.round(Math.random() * 8000000)
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

  enemy = false
  applyGravity = false
  w = 16
  h = 30

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  moveLeft = {
    condition: () => true,
    effect: () => {
      this.direction = 'left'
      this.isMoving = 'left'

      this.status = 'move'
      this.x--
      if (this.frame >= 19) {
        this.frame = 19
        this.y += 2
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
        this.y += 2
      }
        return SUCCESS

    }
  }
  attack = {
    condition: () => {
      if (!this.closestEnemy || this.attackStyle === 'attack2') return false
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
        this.attackStyle = Math.random() < .9 ? 'attack1' : 'attack2'
        return SUCCESS
      }
      if (this.status === 'attack') return SUCCESS

      this.frame = 0
      this.status = 'attack'

      return SUCCESS
    }
  }
  attack2 = {
    condition: () => {
      if (!this.closestEnemy || this.attackStyle === 'attack1') return false
      const attackBox = {
        x: this.getBoundingBox().x - this.attackRange,
        y: this.getBoundingBox().y,
        w: this.getBoundingBox().w + this.attackRange * 2,
        h: this.getBoundingBox().h
      }
      return intersects(attackBox, this.closestEnemy.getBoundingBox())
    },
    effect: () => {
      if (this.status === 'attack2' && this.frame === 4) {
        this.closestEnemy.hurt(this.strength, this.direction === 'left' ? 'right' : 'left', this)
        this.attackStyle = Math.random() < .9 ? 'attack1' : 'attack2'
        return SUCCESS
      }
      if (this.status === 'attack2') return SUCCESS

      this.frame = 0
      this.status = 'attack2'

      return SUCCESS
    }
  }

  onHurt = () => {
    this.protection = 8
    playSound('creatureHurt')
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

  update = () => {
    if (!this.sprite) this.sprite = CTDLGAME.assets.bearWhale
    if (CTDLGAME.lockCharacters) {
      this.frame++
      this.draw()
      return
    }

    this.applyGravity = this.status === 'attack2'
    this.swims = this.status === 'swim'
    this.applyPhysics()
    if (this.status === 'fall') this.status = 'attack2'
    if (this.status === 'hurt' && this.canMove && this.vx === 0 && this.vy === 0) {
      this.status = 'idle'
    }

    const senseBox = this.getSenseBox()
    this.sensedObjects = CTDLGAME.quadTree.query(senseBox)
    const ferry = this.sensedObjects.find(obj => obj.id = 'ferry')

    console.log(this.x - ferry.x)
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
        addTextToQueue('nakadai.MONARCH:\nIt\'s J0E007, the big bear\nwhale! We might see strong volatility ahead.')
        addTextToQueue('nakadai.MONARCH:\nYou have to brace yourself and HODL no matter what, if you want to survive.')
      }
      this.moveLeft.effect()
    } else if (!this.hadIntro && ferry && (this.x - ferry.x < 0 || this.status === 'spawn')) {
      this.status = 'spawn'
      if (this.frame === 0) {
        // move bearwhale in front of ferry
        this.x = ferry.x + ferry.getBoundingBox().w - 16
      } else if (this.frame === 4) {
        ferry.stop()
        playSound('elevatorStop')
        this.idle.effect()
        CTDLGAME.lockCharacters = true
        skipCutSceneButton.active = true
  
        addTextToQueue('nakadai.MONARCH:\nThe sword is the soul. Study the soul to know the sword. Evil mind, evil sword.')
        addTextToQueue('*nakadai.MONARCH joins the battle*', () => {
          if (getSoundtrack() !== 'bearWhalesTheme') initSoundtrack('bearWhalesTheme')
          CTDLGAME.bossFight = true
          CTDLGAME.lockCharacters = false
          skipCutSceneButton.active = false
          this.enemy = true
        })
        this.hadIntro = true
      } else {
        this.y -= 17
      }
    }

    this.sensedFriends = []

    if (Math.abs(this.vy) < 3 && this.canMove && !/exhausted|transform|fall|rekt|hurt/.test(this.status)) {
      if (getSoundtrack() !== 'bearWhalesTheme') initSoundtrack('bearWhalesTheme')

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