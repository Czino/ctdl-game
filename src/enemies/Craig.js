import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE, RUNNING } from '../../node_modules/behaviortree/dist/index.node'

import craig from '../sprites/craig'
import { CTDLGAME } from '../gameUtils'
import { moveObject, intersects, getClosest } from '../geometryUtils'
import { write } from '../font';
import constants from '../constants'
import { addTextToQueue, setTextQueue } from '../textUtils';
import { playSound } from '../sounds';
import Agent from '../Agent'
import { random } from '../arrayUtils'
import { skipCutSceneButton } from '../events'
import { getSoundtrack, initSoundtrack } from '../soundtrack'
import Item from '../Item';

const doesNotTouchEnemy = new Task({
  run: agent => !agent.closestEnemy || !intersects(agent.getBoundingBox(), agent.closestEnemy.getBoundingBox()) ? SUCCESS : FAILURE
})
const touchesEnemy = new Task({
  run: agent => {
    if (!agent.closestEnemy) return FAILURE
    const attackBox = {
      x: agent.getBoundingBox().x - agent.attackRange,
      y: agent.getBoundingBox().y,
      w: agent.getBoundingBox().w + agent.attackRange * 2,
      h: agent.getBoundingBox().h
    }
    return intersects(attackBox, agent.closestEnemy.getBoundingBox()) ? SUCCESS : FAILURE
  }
})
const lookAtEnemy = new Task({
  run: agent => agent.closestEnemy && agent.lookAt.condition(agent.closestEnemy) ? agent.lookAt.effect(agent.closestEnemy) : FAILURE
})
const lookAtItem = new Task({
  run: agent => agent.closestItem && agent.lookAt.condition(agent.closestItem) ? agent.lookAt.effect(agent.closestItem) : FAILURE
})
const moveToClosestEnemy = new Task({
  run: agent => agent.closestEnemy && agent.moveTo.condition({ other: agent.closestEnemy, distance: 4 }) ? agent.moveTo.effect({ other: agent.closestEnemy, distance: 4 }) : FAILURE
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
        'jump'
      ]
    })
  ]
})
// Selector: runs until one node calls success
const wantsItem = new Sequence({
  nodes: [
    'seesItem',
    lookAtItem,
    new Selector({
      nodes: [
        'jump'
      ]
    })
  ]
})


const tree = new Selector({
  nodes: [
    wantsItem,
    attackEnemy,
    goToEnemy,
    'idle'
  ]
})

class Craig extends Agent {
  constructor(id, options) {
    super(id, options)
    this.spriteData = craig
    this.maxHealth = 210
    this.health = options.health ?? 210
    this.usd = 66000
    this.strength = 5
    this.attackRange = 8
    this.senseRadius = 50
    this.protection = 0
    this.hadIntro = options.hadIntro || false
    this.canMove = options.hadIntro || false
    this.hasArmor = options.hasArmor ?? true
    this.walkingSpeed = this.hasArmor ? 2 : 3
    this.hitsToSuckUp = options.hitsToSuckUp || 0
  }

  says = []
  w = 16
  h = 30

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  attack = {
    condition: () => true,
    effect: () => {
      if (!/attack/i.test(this.status)) this.frame = 0
      this.status = 'attack'

      if (this.frame !== 3) return SUCCESS
      this.makeDamage(this.strength)
      return SUCCESS
    }
  }
  attackMoveLeft = {
    condition: () => true,
    effect: () => {
      this.direction = 'left'
      const hasMoved = !moveObject(this, { x: -this.walkingSpeed, y: 0 }, CTDLGAME.quadTree)

      if (hasMoved) {
        this.status = 'moveAttack'
        if (this.frame !== 3) return RUNNING
        this.makeDamage(this.strength)
        return SUCCESS
      }
      return FAILURE
    }
  }
  attackMoveRight = {
    condition: () => true,
    effect: () => {
      this.direction = 'right'

      const hasMoved = !moveObject(this, { x: this.walkingSpeed , y: 0}, CTDLGAME.quadTree)
      if (hasMoved) {
        this.status = 'moveAttack'
        if (this.frame !== 3) return RUNNING
        this.makeDamage(this.stength)
        return SUCCESS
      }
      return FAILURE
    }
  }
  jump = {
    condition: () => !this.hasArmor && this.canJump(),
    effect: () => {
      if (this.status !== 'jump') this.frame = 0
      this.status = 'jump'
      this.vx = this.direction === 'right' ? 6 : -6
      this.vy = -6

      return SUCCESS
    }
  }

  hurt = (dmg, direction) => {
    this.hitsToSuckUp--
    if (!this.hitsToSuckUp && /hurt|rekt/.test(this.status) || this.protection > 0) return
    if (!this.hitsToSuckUp && this.hasArmor && Math.random() < .2) {
      this.say('Fuck off!')
      this.protection = 8
      return
    }
    if (!this.hasArmor && Math.random() < .3) {
      this.say('Fuck off!')
      this.protection = 16
      if (Math.random() < .5) {
        CTDLGAME.objects.push(new Item(
          'pizza',
          {
            x: this.x - (this.senseRadius - 10) > 18 * 8 ? this.x - (this.senseRadius - 10) : this.x + (this.senseRadius - 10),
            y: this.y - 4
          }
        ))
      }
      return
    }
    const lostFullPoint = Math.floor(this.health) - Math.floor(this.health - dmg) > 0
    this.health = Math.max(this.health - dmg, 0)

    if (!lostFullPoint) return

    this.dmgs.push({y: -8, dmg: Math.ceil(dmg)})
    this.status = 'hurt'
    let impulse = this.hasArmor ? 2 : 5
    this.vx = direction === 'left' ? impulse : -impulse
    this.vy = -3
    this.protection = 8
    playSound('playerHurt')
    if (this.health / this.maxHealth <= .2) this.say('help!')
    if (this.health <= 0) {
      this.health = 0
      this.die()
    }
  }

  onDie = () => {
    setTextQueue([])
    addTextToQueue('Faketoshi:\nFuck!')
    CTDLGAME.bossFight = true
  }

  die = () => {
    if (this.hasArmor) {
      setTextQueue([])
      CTDLGAME.lockCharacters = true
      skipCutSceneButton.active = true

      addTextToQueue('Faketoshi:\nI don\'t need this fucking\narmor to beat you!', () => {
        this.canMove = true
        CTDLGAME.lockCharacters = false
        skipCutSceneButton.active = false
        this.hasArmor = false
        this.health = this.maxHealth
        this.sprite = CTDLGAME.assets.craig
        this.strength++
        this.protection = 32
        initSoundtrack('makeOrBreak')
      })
      return
    }

    this.status = 'rekt'
    CTDLGAME.inventory.usd += this.usd

    return this.onDie()
  }

  update = () => {
    if (!this.sprite) this.sprite = CTDLGAME.assets[this.hasArmor ? 'craigWithArmor' : 'craig']

    if (CTDLGAME.lockCharacters) {
      this.draw()
      return
    }

    this.applyPhysics()
    if (this.status === 'fall' && this.id === 'craig') CTDLGAME.lightningTorch = null
    if (this.status === 'fall' && this.vy === 0) this.status = 'idle'

    if (this.status === 'hurt' && this.vx === 0 && this.vy === 0) {
      this.status = 'idle'
    }

    const senseBox = this.getSenseBox()
    this.sensedObjects = CTDLGAME.quadTree.query(senseBox)

    if (window.DRAWSENSORS) {
      constants.charContext.beginPath()
      constants.charContext.rect(senseBox.x, senseBox.y, senseBox.w, senseBox.h)
      constants.charContext.stroke()
    }

    this.sensedEnemies = this.sensedObjects
      .filter(enemy => enemy.getClass() === 'Character' && enemy.health > 0)
      .filter(enemy => Math.abs(enemy.getCenter().x - this.getCenter().x) <= this.senseRadius)

    this.sensedItems = this.sensedObjects
      .filter(enemy => enemy.getClass() === 'Item')
      .filter(enemy => Math.abs(enemy.getCenter().x - this.getCenter().x) <= this.senseRadius)

    this.touchedObjects = this.sensedItems
      .filter(obj => obj.touch)
      .filter(obj => intersects(this.getBoundingBox(), obj.getBoundingBox()))
      .forEach(obj => obj.touch(this))

    if (!this.hadIntro && this.sensedEnemies.length > 0) {
      CTDLGAME.lockCharacters = true
      skipCutSceneButton.active = true

      addTextToQueue('Faketoshi:\nPiss off space cat!\nI invented Bitcoin.')
      addTextToQueue('Faketoshi:\nI\'ve got\nthe first fucking nine keys,')
      addTextToQueue('Faketoshi:\n I\'ve got the fucking genesis bloody block, I\'ve got the\nfucking code!')
      addTextToQueue('Faketoshi:\nYou are so annoying. I don\'t have to proof you anything. ')
      addTextToQueue('Faketoshi:\nI let my katana tell you\nwhat I think of you!', () => {
        this.canMove = true
        CTDLGAME.bossFight = true
        CTDLGAME.lockCharacters = false
        skipCutSceneButton.active = false
      })
      this.hadIntro = true
    }

    this.sensedFriends = []

    if (Math.abs(this.vy) < 3 && this.canMove && !/jump|fall|rekt|hurt/.test(this.status)) {
      if (CTDLGAME.hodlonaut.status !== 'rekt') {
        if (getSoundtrack() !== 'craigsTheme' && this.hasArmor) initSoundtrack('craigsTheme')
        if (getSoundtrack() !== 'makeOrBreak' && !this.hasArmor) initSoundtrack('makeOrBreak')
      }

      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.closestFriend = getClosest(this, this.sensedFriends)
      this.closestItem = getClosest(this, this.sensedItems)
      this.bTree.step()
    }

    if (this.status !== 'idle' || Math.random() < .05) {
      this.frame++
    }

    if (this.frame >= this.spriteData[this.direction][this.status].length) {
      this.frame = 0
      if (/jump|action/.test(this.status)) this.status = 'idle'
    }

    this.draw()

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
          x: this.getCenter().x - 50,
          y: this.y + say.y,
          w: 100
        }, 'center', false, 20, false, '#FFF')
        return {
          ...say,
          y: say.y - 1
        }
      })
  }

  say = say => {
    this.says = [{y: -8, say}]
  }

  thingsToSay = [
    ['Craig:\nI am Satoshi and I will prove it to you!'],
    ['Craig:\nFuck off!'],
    ['Craig:\nHahaha, I\'ve got more money than your country!'],
  ]

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
export default Craig