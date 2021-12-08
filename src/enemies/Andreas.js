import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

import andreas from '../sprites/andreas'
import { CTDLGAME } from '../gameUtils'
import { moveObject, intersects, getClosest } from '../geometryUtils'
import { capitalize } from '../stringUtils'
import constants from '../constants'
import { addTextToQueue } from '../textUtils'
import Human from '../npcs/Human'
import { random } from '../arrayUtils'

const sprites = {
  andreas
}

// Behaviour: shall explore the rabbit hole, when not in viewport can randomly teleport to a predefined place (to make it feel like he is able to move anywhere)
// Studies enemy
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
const duck = new Task({
  run: agent => agent.duck.condition() ? agent.duck.effect() : FAILURE
})
const moveToClosestEnemy = new Task({
  run: agent => agent.closestEnemy && agent.moveTo.condition({ other: agent.closestEnemy, distance: 9 }) ? agent.moveTo.effect({ other: agent.closestEnemy, distance: 9 }) : FAILURE
})

// Sequence: runs each node until fail
const attackEnemy = new Sequence({
  nodes: [
    'lookAtEnemy',
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


const tree = new Selector({
  nodes: [
    attackEnemy,
    goToEnemy,
    'moveRandom',
    'idle'
  ]
})

class Andreas extends Human {
  constructor(id, options) {
    super(id, options)
    this.spriteData = sprites[id]
    this.maxHealth = options.maxHealth ?? 5
    this.health = options.health ?? 5
    this.strength = 1
    this.attackRange = 9
    this.senseRadius = 50
    this.walkingSpeed = options.walkingSpeed || 3
    this.duckSpeed = options.duckSpeed || 2
    this.protection = 0
  }

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

      const hasMoved = !moveObject(this, { x: -this.walkingSpeed, y: 0 }, CTDLGAME.quadTree)

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

      const hasMoved = !moveObject(this, { x: this.walkingSpeed , y: 0}, CTDLGAME.quadTree)
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

      const hasMoved = !moveObject(this, { x: -this.duckSpeed, y: 0 }, CTDLGAME.quadTree)
      return hasMoved
    }
  }
  duckMoveRight = {
    condition: () => this.canDuck(),
    effect: () => {
      this.direction = 'right'
      this.status = 'duckMove'

      const hasMoved = !moveObject(this, { x: this.duckSpeed, y: 0 }, CTDLGAME.quadTree)
      return hasMoved
    }
  }
  attack = {
    condition: () => true,
    effect: () => {
      if (!/attack/i.test(this.status)) this.frame = 0
      this.status = /duck/.test(this.status) ? 'duckAttack': 'attack'

      return SUCCESS
    }
  }
  attackMoveLeft = {
    condition: () => true,
    effect: () => {
      this.direction = 'left'
      const hasMoved = !moveObject(this, { x: -this.walkingSpeed, y: 0 }, CTDLGAME.quadTree)

      if (hasMoved) {
        this.status = /duck/.test(this.status) ? 'duckMoveAttack': 'moveAttack'
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
        this.status = /duck/.test(this.status) ? 'duckMoveAttack': 'moveAttack'
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
      .filter(obj => obj.isSolid && !obj.enemy && /Tile|Ramp|Boundary/.test(obj.getClass()))
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
      .filter(obj => obj.isSolid && !obj.enemy && /Tile|Ramp|Boundary/.test(obj.getClass()))
      .filter(obj => intersects(obj, standUpTo))

    return obstacles.length === 0
  }

  die = () => {
    this.status = 'rekt'
    this.health = 0

    addTextToQueue(`${capitalize(this.id)} got rekt`)
  }

  draw = () => {
    let spriteData = this.spriteData[this.direction][this.status]

    if (this.frame >= spriteData.length) {
      this.frame = 0
    }

    let data = spriteData[this.frame]
    this.w = data.w
    this.h = data.h

    constants.charContext.globalAlpha = data.opacity ?? 1
    if (this.protection > 0) {
      this.protection--
      constants.charContext.globalAlpha = this.protection % 2
    }
    constants.gameContext.drawImage(
      CTDLGAME.assets.andreas,
      data.x, data.y, this.w, this.h,
      this.x, this.y, this.w, this.h
    )
    constants.charContext.globalAlpha = 1

    this.drawDmgs()
    this.drawHeals()
    this.drawSays()
  }

  update = () => {
    if (CTDLGAME.lockCharacters) {

      this.draw()
      return
    }

    this.applyPhysics()
    if (this.status === 'fall' && this.id === 'andreas') CTDLGAME.lightningTorch = null
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
      .filter(being => being.health && being.health > 0)
      .filter(being => Math.abs(being.getCenter().x - this.getCenter().x) <= this.senseRadius)

    this.sensedFriends = this.sensedObjects
      .filter(friend => friend.getClass() === 'Character' && friend.status !== 'rekt')
      .filter(friend => Math.abs(friend.getCenter().x - this.getCenter().x) <= this.senseRadius)

    if (Math.abs(this.vy) < 3 && !/jump|fall|rekt|hurt/.test(this.status)) {
      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.closestFriend = getClosest(this, this.sensedFriends)
      this.bTree.step()
    }

    this.glows = /attack/.test(this.status)

    if (this.status !== 'idle' || Math.random() < .05) {
      this.frame++
    }

    if (this.frame >= this.spriteData[this.direction][this.status].length) {
      this.frame = 0
      if (/jump|action/.test(this.status)) this.status = 'idle'
    }


    this.draw()
  }

  thingsToSay = [
    ['Andreas:\nWe need open blockchains'],
    ['Andreas:\nEthereum\'s technology\nis very interesting'],
    ['Andreas:\nI can see a few interesting technologies across an\nentire ecosystem'],
    ['Andreas:\nI am not a maximalist'],
    [
      'Andreas:\nI don\'t see these systems\nas competing.',
      'Andreas:\nThey serve different niches, in my opinion.'
    ],
    [
      'Andreas:\nI want to calculate the\nprecise supply of\nfucks to give.',
      'Andreas:\nI think it might require\na script.'
    ],
    ['Andreas:\nImmutability is not a waste of energy. Christmas lights are a waste of energy']
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

  getLightSource = () => ({
    x: this.direction === 'left' ? this.getBoundingBox().x - 3: this.getBoundingBox().x + this.getBoundingBox().w + 3,
    y: this.getBoundingBox().y + 5,
    color: '#24e9b0',
    brightness: .3
  })
}
export default Andreas