import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE, RUNNING } from '../node_modules/behaviortree/dist/index.node'

import hodlonaut from './sprites/hodlonaut'
import katoshi from './sprites/katoshi'
import { CTDLGAME } from './gameUtils'
import { moveObject, intersects, getClosest } from './geometryUtils'
import { capitalize } from './stringUtils'
import { write } from './font';
import constants from './constants'
import { addTextToQueue } from './textUtils';
import { playSound } from './sounds';
import { duckButton, backButton } from './events'
import Agent from './Agent'

const sprites = {
  hodlonaut,
  katoshi
}

const follows = new Task({
  run: agent => agent.follow ? SUCCESS : FAILURE
})
const seesFriend = new Task({
  run: agent => agent.sensedFriends.length > 0 ? SUCCESS : FAILURE
})
const doesNotTouchEnemy = new Task({
  run: agent => !agent.closestEnemy || !intersects(agent.getBoundingBox(), agent.closestEnemy.getBoundingBox()) ? SUCCESS : FAILURE
})
const touchesEnemy = new Task({
  run: agent => agent.closestEnemy && intersects(agent.getBoundingBox(), agent.closestEnemy.getBoundingBox()) ? SUCCESS : FAILURE
})
const lookAtEnemy = new Task({
  run: agent => agent.closestEnemy && agent.lookAt.condition(agent.closestEnemy) ? agent.lookAt.effect(agent.closestEnemy) : FAILURE
})
const duck = new Task({
  run: agent => agent.duck.condition() ? agent.duck.effect() : FAILURE
})
const moveToClosestEnemy = new Task({
  run: agent => agent.closestEnemy && agent.moveTo.condition({ other: agent.closestEnemy, distance: -1 }) ? agent.moveTo.effect({ other: agent.closestEnemy, distance: -1 }) : FAILURE
})
const moveToFriend = new Task({
  run: agent => agent.closestFriend && agent.moveTo.condition({ other: agent.closestFriend, distance: 10 }) ? agent.moveTo.effect({ other: agent.closestFriend, distance: 10 }) : FAILURE
})

// Sequence: runs each node until fail
const attackEnemy = new Sequence({
  nodes: [
    lookAtEnemy,
    touchesEnemy,
    'attack'
  ]
})

// Selector: runs until one node calls success
const goToEnemy = new Sequence({
  nodes: [
    'seesEnemy',
    doesNotTouchEnemy,
    new Selector({
      nodes: [
        moveToClosestEnemy,
        'jump',
        duck
      ]
    })
  ]
})


// Selector: runs until one node calls success
const goToFriend = new Sequence({
  nodes: [
    follows,
    seesFriend,
    new Selector({
      nodes: [
        moveToFriend,
        'jump',
        duck
      ]
    })
  ]
})

const tree = new Selector({
  nodes: [
    attackEnemy,
    goToEnemy,
    goToFriend,
    'moveRandom',
    'idle'
  ]
})

class Character extends Agent {
  constructor(id, options) {
    super(id, options)
    this.spriteData = sprites[id]
    this.maxHealth = options.maxHealth ?? 21
    this.health = options.health ?? 21
    this.selected = options.selected
    this.strength = id === 'hodlonaut' ? 1 : 3
    this.attackRange = id === 'hodlonaut' ? 1 : 5
    this.senseRadius = 50
    this.follow = options.follow ?? true
    this.walkingSpeed = options.walkingSpeed || 3
    this.duckSpeed = options.duckSpeed || 2
    this.protection = 0
  }

  class = 'Character'
  says = []
  w = 16
  h = 30

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  idle = {
    condition: () => true,
    effect: () => {
      if (!this.canStandUp() && this.duck.condition()) return this.duck.effect()
      this.status = 'idle'
      return SUCCESS
    }
  }
  moveLeft = {
    condition: () => true,
    effect: () => {
      if (!this.canStandUp() && this.duckMoveLeft.condition()) return this.duckMoveLeft.effect()

      this.direction = 'left'

      const hasMoved =  moveObject(this, { x: -this.walkingSpeed, y: 0 }, CTDLGAME.quadTree)

      if (hasMoved) {
        this.status = 'move'
        return SUCCESS
      }

      return FAILURE
    }
  }
  moveRight = {
    condition: () => true,
    effect: () => {
      if (!this.canStandUp() && this.duckMoveRight.condition()) return this.duckMoveRight.effect()

      this.direction = 'right'

      const hasMoved = moveObject(this, { x: this.walkingSpeed , y: 0}, CTDLGAME.quadTree)
      if (hasMoved) {
        this.status = 'move'
        return SUCCESS
      }

      return FAILURE
    }
  }
  duck = {
    condition: () => true,
    effect: () => {
      this.status = 'duck'
      return SUCCESS
    }
  }
  duckMoveLeft = {
    condition: () => this.canDuck(),
    effect: () => {
      this.direction = 'left'
      this.status = 'duckMove'

      const hasMoved = moveObject(this, { x: -this.duckSpeed, y: 0 }, CTDLGAME.quadTree)
      return hasMoved
    }
  }
  duckMoveRight = {
    condition: () => this.canDuck(),
    effect: () => {
      this.direction = 'right'
      this.status = 'duckMove'

      const hasMoved = moveObject(this, { x: this.duckSpeed, y: 0 }, CTDLGAME.quadTree)
      return hasMoved
    }
  }
  attack = {
    condition: () => true,
    effect: () => {
      if (!/attack/i.test(this.status)) this.frame = 0
      this.status = /duck/.test(this.status) ? 'duckAttack': 'attack'

      if (this.id === 'katoshi' && this.frame !== 3) return SUCCESS
      this.makeDamage(1)
      return SUCCESS
    }
  }
  attackMoveLeft = {
    condition: () => true,
    effect: () => {
      this.direction = 'left'
      const hasMoved =  moveObject(this, { x: -this.walkingSpeed, y: 0 }, CTDLGAME.quadTree)

      if (hasMoved) {
        this.status = /duck/.test(this.status) ? 'duckMoveAttack': 'moveAttack'
        if (this.id === 'katoshi' && this.frame !== 3) return RUNNING
        this.makeDamage(this.id === 'katoshi' ? .8 : 1)
        return SUCCESS
      }
      return FAILURE
    }
  }
  attackMoveRight = {
    condition: () => true,
    effect: () => {
      this.direction = 'right'

      const hasMoved = moveObject(this, { x: this.walkingSpeed , y: 0}, CTDLGAME.quadTree)
      if (hasMoved) {
        this.status = /duck/.test(this.status) ? 'duckMoveAttack': 'moveAttack'
        if (this.id === 'katoshi' && this.frame !== 3) return RUNNING
        this.makeDamage(this.id === 'katoshi' ? .8 : 1)
        return SUCCESS
      }
      return FAILURE
    }
  }
  jump = {
    condition: () => this.canJump() && this.canStandUp(),
    effect: () => {
      if (this.status !== 'jump') this.frame = 0
      this.status = 'jump'
      this.vx = this.direction === 'right' ? 6 : -6
      this.vy = -6

      return SUCCESS
    }
  }
  back = {
    condition: () => this.canStandUp(),
    effect: () => {
      this.status = 'back'

      const boundingBox = this.getBoundingBox()
      const eventObject =  CTDLGAME.quadTree.query(boundingBox)
        .filter(obj => obj.backEvent)
        .find(obj => intersects(boundingBox, obj.getBoundingBox()))

      if (!eventObject) return FAILURE

      eventObject.backEvent(this)
      return SUCCESS
    }
  }
  action = {
    condition: () => this.canStandUp(),
    effect: () => {
      this.frame = 0
      this.status = 'action'
      return SUCCESS
    }
  }

  canDuck = () => {
    let duckTo = this.getBoundingBox()
    duckTo.y += 6
    duckTo.x += this.direction === 'right' ? 3 : -3
    duckTo.h -= 6

    if (window.DRAWSENSORS) {
      constants.overlayContext.globalAlpha = .5
      constants.overlayContext.fillStyle = 'blue'
      constants.overlayContext.fillRect(duckTo.x, duckTo.y, duckTo.w, duckTo.h)
      constants.overlayContext.globalAlpha = 1
    }
    let obstacles = CTDLGAME.quadTree.query(duckTo)
      .filter(obj => obj.isSolid && !obj.enemy && obj.class !== 'Ramp')
      .filter(obj => intersects(obj, duckTo))

    return obstacles.length === 0
  }

  canStandUp = () => {
    if (!/duck/.test(this.status)) return SUCCESS
    let standUpTo = this.getBoundingBox()
      standUpTo.y -= 6
      standUpTo.h = 6

    if (window.DRAWSENSORS) {
      constants.overlayContext.globalAlpha = .5
      constants.overlayContext.fillStyle = 'green'
      constants.overlayContext.fillRect(standUpTo.x, standUpTo.y, standUpTo.w, standUpTo.h)
      constants.overlayContext.globalAlpha = 1
    }
    let obstacles = CTDLGAME.quadTree.query(standUpTo)
      .filter(obj => obj.isSolid && !obj.enemy && obj.class !== 'Ramp')
      .filter(obj => intersects(obj, standUpTo))

    return obstacles.length === 0
  }

  makeDamage = multiplier => {
    if (this.id === 'hodlonaut') playSound('lightningTorch')
    if (this.id === 'katoshi') playSound('sword')
    const boundingBox = this.getBoundingBox()

    this.sensedEnemies
      .filter(enemy =>
        intersects({
          x: this.direction === 'left' ? boundingBox.x - this.attackRange : boundingBox.x + boundingBox.w,
          y: boundingBox.y,
          w: this.attackRange,
          h: boundingBox.h
        }, enemy.getBoundingBox()))
      .filter((_, index) => index <= 2) // can only hurt 3 enemies at once
      .forEach(enemy => {
        let dmg = Math.round(this.strength * (1 + Math.random() / 4))
        if (this.id === 'hodlonaut') dmg *= (1 + CTDLGAME.inventory.sats / 100000000)

        enemy.hurt(Math.round(dmg * multiplier), this.direction === 'left' ? 'right' : 'left')
      })
  }

  hurt = (dmg, direction) => {
    if (/hurt|rekt/.test(this.status) || this.protection > 0) return
    const lostFullPoint = Math.floor(this.health) - Math.floor(this.health - dmg) > 0
    this.health = Math.max(this.health - dmg, 0)

    if (!lostFullPoint) return

    this.dmgs.push({y: -8, dmg: Math.ceil(dmg)})
    this.status = 'hurt'
    this.vx = direction === 'left' ? 5 : -5
    this.vy = -3
    this.protection = 8
    playSound('playerHurt')
    if (this.health / this.maxHealth <= .2) this.say('help!')
    if (this.health <= 0) {
      this.health = 0
      this.die() // :(
    }
  }

  die = () => {
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

  senseControls = () => {
    let id = CTDLGAME.multiPlayer ? this.id : 'singlePlayer'

    let controls = []
    if (CTDLGAME.touchScreen && this.selected) {
      controls = Object.keys(constants.CONTROLS[id])
        .filter(key => window.BUTTONS.some(button => button.action === constants.CONTROLS[id][key]))
        .map(key => constants.CONTROLS[id][key])
    } else {
      controls = Object.keys(constants.CONTROLS[id])
        .filter(key => window.KEYS.indexOf(key) !== -1)
        .map(key => constants.CONTROLS[id][key])
    }

    let action = 'idle'
    // merge mixed behaviours
    if (controls.indexOf('attack') !== -1 && controls.indexOf('moveLeft') !== -1) {
      action = 'attackMoveLeft'
    } else if (controls.indexOf('attack') !== -1 && controls.indexOf('moveRight') !== -1) {
      action = 'attackMoveRight'
    } else if (controls.indexOf('duck') !== -1 && controls.indexOf('attack') !== -1) {
      action = 'attack'
    } else if (controls.indexOf('duck') !== -1 && controls.indexOf('moveLeft') !== -1) {
      action = 'duckMoveLeft'
    } else if (controls.indexOf('duck') !== -1 && controls.indexOf('moveRight') !== -1) {
      action = 'duckMoveRight'
    } else if (controls.length > 0) {
      action = controls.pop()
    }

    if (this[action].condition()) this[action].effect()
  }

  update = () => {
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

    this.applyPhysics()

    if (this.status === 'fall' && this.vy === 0) this.status = 'idle'

    if (this.status === 'hurt' && this.vx === 0 && this.vy === 0) {
      this.status = 'idle'
    }

    const boundingBox = this.getBoundingBox()
    const senseBox = {
      x: this.x - this.senseRadius,
      y: this.y - this.senseRadius,
      w: this.w + this.senseRadius * 2,
      h: this.h + this.senseRadius * 2
    }
    this.sensedObjects = CTDLGAME.quadTree
      .query(senseBox)

    if (window.DRAWSENSORS) {
      constants.charContext.beginPath()
      constants.charContext.rect(senseBox.x, senseBox.y, senseBox.w, senseBox.h)
      constants.charContext.stroke()
    }

    this.sensedEnemies = this.sensedObjects
      .filter(enemy => enemy.enemy && enemy.status !== 'rekt' && enemy.status !== 'burning')
      .filter(enemy => Math.abs(enemy.getCenter().x - this.getCenter().x) <= this.senseRadius)

    this.sensedFriends = this.sensedObjects
      .filter(friend => friend.class === 'Character' && friend.id !== this.id && friend.status !== 'rekt')
      .filter(friend => Math.abs(friend.getCenter().x - this.getCenter().x) <= this.senseRadius)

    // if (this.id === 'hodlonaut') console.log(this.senseRadius, this.sensedFriends)
    this.touchedObjects = CTDLGAME.quadTree
      .query(boundingBox)
      .filter(obj => intersects(boundingBox, obj.getBoundingBox()))

    // collect touched items
    this.touchedObjects
      .filter(obj => obj.touch)
      .forEach(obj => obj.touch(this))

    // sense backEvents
    if (CTDLGAME.touchScreen && this.selected) {
      let backEvent = this.touchedObjects.filter(obj => obj.backEvent)

      if (backEvent) {
        duckButton.active = false
        backButton.active = true
      } else {
        duckButton.active = true
        backButton.active = false
      }
    }

    if (this.vy === 0 && !/jump|fall|rekt|hurt/.test(this.status)) {
      if (CTDLGAME.multiPlayer || this.selected) {
        this.senseControls()
      } else {
        this.closestEnemy = getClosest(this, this.sensedEnemies)
        this.closestFriend = getClosest(this, this.sensedFriends)
        this.bTree.step()
      }
    }

    // find out if touched objects have touch event
    this.touchedObjects
      .filter(obj => obj.touchEvent)
      .forEach(obj => obj.touchEvent(this))

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
    if (this.protection > 0) {
      this.protection--
      constants.charContext.globalAlpha = this.protection % 2
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
          x: this.getCenter().x - 6,
          y: this.y + dmg.y,
          w: 12
        }, 'center', false, 4, true, '#F00')
        return {
          ...dmg,
          y: dmg.y - 1
        }
      })
    this.heals = this.heals
      .filter(heal => heal.y > -24)
      .map(heal => {
        write(constants.charContext, `+${heal.heal}`, {
          x: this.getCenter().x - 6,
          y: this.y + heal.y,
          w: 12
        }, 'center', false, 4, true, '#0F0')
        return {
          ...heal,
          y: heal.y - 1
        }
      })
    this.says = this.says
      .filter(say => say.y > -24)
      .map(say => {
        write(constants.charContext, say.say, {
          x: this.getCenter().x - 26,
          y: this.y + say.y,
          w: 52
        }, 'center', false, 5, false, '#FFF')
        return {
          ...say,
          y: say.y - 1
        }
      })
  }

  say = say => {
    this.says = [{y: -8, say}]
  }

  select = () => {
    if (this.selected || CTDLGAME.multiPlayer || this.status === 'rekt') return
    this.follow = !this.follow
    window.SELECTEDCHARACTER.follow = this.follow

    window.SELECTEDCHARACTER.say(this.follow ? 'come' : 'wait')
  }

  choose = () => {
    if (this.status === 'rekt') return
    if (window.SELECTEDCHARACTER) window.SELECTEDCHARACTER.unselect()
    this.selected = true
    window.SELECTEDCHARACTER = this
  }

  unselect = () => {
    this.selected = false
    window.SELECTEDCHARACTER = null
  }

  getBoundingBox = () => /duck/.test(this.status)
    ? ({ // ducking
      id: this.id,
      x: this.x + 6,
      y: this.y + 12,
      w: this.w - 12,
      h: this.h - 12
    })
    : this.status !== 'rekt'
    ? ({ // normal
        id: this.id,
        x: this.x + 6,
        y: this.y + 6,
        w: this.w - 12,
        h: this.h - 6
      })
    : ({ // rekt
      id: this.id,
      x: this.x + 5,
      y: this.y + 3,
      w: this.w - 10,
      h: this.h - 3
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
export default Character