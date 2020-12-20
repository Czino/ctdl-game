import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

import citizenSpriteData from '../sprites/citizen'
import { CTDLGAME } from '../gameUtils'
import { moveObject, intersects, getClosest } from '../geometryUtils'
import { capitalize, hexToRgb } from '../stringUtils'
import { write } from '../font';
import constants from '../constants'
import { addTextToQueue } from '../textUtils';
import { playSound } from '../sounds';
import Agent from '../Agent'
import { random } from '../arrayUtils'

const sprites = [
  'citizen1',
  'citizen2',
  'citizen3',
  'citizen4',
  'citizen5'
]

const colorOverrides = {
  hair: hexToRgb('#00ff00'),
  skin: [hexToRgb('#ffffff'), hexToRgb('#aaaaaa')],
  top: [hexToRgb('#ff0000'), hexToRgb('#ffff00')],
  pants: [hexToRgb('#0000ff'), hexToRgb('#00ffff'), hexToRgb('#ff00ff')]
}

const colorSchemes = {
  hair: [
    hexToRgb('#d5a01a'),
    hexToRgb('#b68f2d'),
    hexToRgb('#5a3525'),
    hexToRgb('#1f1510')
  ],
  skin: [
    hexToRgb('#cca094'),
    hexToRgb('#5d301e'),
    hexToRgb('#a36f60')
  ],
  clothes: [
    [hexToRgb('#E88210'), hexToRgb('#A0140D')],
    [hexToRgb('#575757'), hexToRgb('#851c1c')],
    [hexToRgb('#734b3a'), hexToRgb('#3b587b')],
    [hexToRgb('#eeeeee'), hexToRgb('#2c2c2d')],
    [hexToRgb('#242424'), hexToRgb('#212121')],
    [hexToRgb('#1a523a'), hexToRgb('#2c2c2d')],
    [hexToRgb('#666666'), hexToRgb('#425D8C')],
    [hexToRgb('#1b02ab'), hexToRgb('#98befa')],
  ]
}

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
const isUnhappy = new Task({
  run: () => CTDLGAME.world.map.state.protestScene ? SUCCESS : FAILURE
})
const isProtestLeader = new Task({
  run: agent => agent.id === 'protest-leader' ? SUCCESS : FAILURE
})
const talk = new Task({
  run: agent => {
    agent.status = 'attack'
    return SUCCESS
  }
})


const moveToClosestEnemy = new Task({
  run: agent => agent.closestEnemy && agent.moveTo.condition({ other: agent.closestEnemy, distance: 9 }) ? agent.moveTo.effect({ other: agent.closestEnemy, distance: 9 }) : FAILURE
})

const survive = new Sequence({
  nodes: [
    'hasLowHealth',
    'runAwayFromClosestEnemy'
 ]
})

// Selector: runs until one node calls success
const regularBehaviour = new Selector({
  nodes: [
    'moveRandom',
    'idle'
  ]
})

// Sequence: runs each node until fail
const goToEnemy = new Sequence({
  nodes: [
    'seesEnemy',
    doesNotTouchEnemy,
    new Selector({
      nodes: [
        moveToClosestEnemy
      ]
    })
  ]
})


// Sequence: runs each node until fail
const protest = new Sequence({
  nodes: [
    isUnhappy,
    lookAtEnemy,
    touchesEnemy,
    'attack'
  ]
})
// Sequence: runs each node until fail
const leadProtest = new Sequence({
  nodes: [
    isUnhappy,
    isProtestLeader,
    talk
  ]
})

// only "protest while condition is met otherwise just walk around
const tree = new Selector({
  nodes: [
    survive,
    leadProtest,
    protest,
    regularBehaviour
  ]
})

class Citizen extends Agent {
  constructor(id, options) {
    super(id, options)
    this.spriteId = options.spriteId || random(sprites)
    this.spriteData = citizenSpriteData
    this.maxHealth = options.maxHealth ?? Math.round(Math.random() * 5) + 5
    this.health = options.health ?? this.maxHealth
    this.strength = 1
    this.context = options.context || (Math.random() < .5 ? 'bgContext' : 'charContext')
    this.attackRange = options.attackRange ?? Math.ceil(Math.random() * 70)
    this.hasSign = options.hasSign ?? Math.random() < .1
    this.films = options.films ?? Math.random() < .1
    this.senseRadius = this.attackRange
    this.applyGravity = options.applyGravity ?? true
    this.walkingSpeed = options.walkingSpeed || 3
    this.runningSpeed = options.runningSpeed || Math.round(Math.random() * 2) + 4
    this.protection = 0

    this.hair = options.hair || random(colorSchemes.hair)
    this.skin = options.skin || random(colorSchemes.skin)
    this.clothes = options.clothes || random(colorSchemes.clothes)
    this.delay = Math.round(Math.random() * 2) * constants.FRAMERATE
    this.speed = Math.round(Math.random() * 3) * constants.FRAMERATE
  }

  class = 'Citizen'
  says = []
  w = 16
  h = 30


  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  runLeft = {
    condition: () => true,
    effect: () => {
      this.direction = 'left'
      this.isMoving = 'left'
      const hasMoved =  !moveObject(this, { x: -this.runningSpeed, y: 0 }, CTDLGAME.quadTree)

      if (hasMoved) {
        this.status = 'move'
        return SUCCESS
      }

      return FAILURE
    }
  }
  runRight = {
    condition: () => true,
    effect: () => {
      this.direction = 'right'
      this.isMoving = 'right'

      const hasMoved = !moveObject(this, { x: this.runningSpeed , y: 0}, CTDLGAME.quadTree)
      if (hasMoved) {
        this.status = 'move'
        return SUCCESS
      }

      return FAILURE
    }
  }

  attack = {
    condition: () => {
      return SUCCESS
    },
    effect: () => {
      this.status = this.hasSign
        ? 'hold'
        : this.films
        ? 'action'
        : 'attack'

      return SUCCESS
    }
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
      this.die()
    }
  }

  die = () => {
    this.status = 'rekt'
    this.health = 0

    addTextToQueue(`${capitalize(this.id)} got rekt`)
  }

  draw = () => {
    if (!this.sprite) {
      this.sprite = CTDLGAME.assets[this.spriteId]
      constants.helperCanvas.width = this.sprite.width
      constants.helperCanvas.height = this.sprite.height
      constants.helperContext.clearRect(0, 0, this.sprite.width, this.sprite.height)
      constants.helperContext.drawImage(
        this.sprite,
        0, 0, this.sprite.width, this.sprite.height,
        0, 0, this.sprite.width, this.sprite.height
      )

      // pull the entire image into an array of pixel data
      let imageData = constants.helperContext.getImageData(0, 0, this.sprite.width, this.sprite.height);

      // examine every pixel,
      // change any old rgb to the new-rgb
      for (let i = 0, len = imageData.data.length; i < len; i += 4) {
        if (imageData.data[i] === colorOverrides.hair.r &&
          imageData.data[i + 1] === colorOverrides.hair.g &&
          imageData.data[i + 2] === colorOverrides.hair.b
        ) {
          imageData.data[i] = this.hair.r
          imageData.data[i + 1] = this.hair.g
          imageData.data[i + 2] = this.hair.b
        } else if (imageData.data[i] === colorOverrides.skin[0].r &&
          imageData.data[i + 1] === colorOverrides.skin[0].g &&
          imageData.data[i + 2] === colorOverrides.skin[0].b
        ) {
          imageData.data[i] = this.skin.r
          imageData.data[i + 1] = this.skin.g
          imageData.data[i + 2] = this.skin.b
        } else if (imageData.data[i] === colorOverrides.skin[1].r &&
          imageData.data[i + 1] === colorOverrides.skin[1].g &&
          imageData.data[i + 2] === colorOverrides.skin[1].b
        ) {
          imageData.data[i] = Math.round(this.skin.r / 3 * 2)
          imageData.data[i + 1] = Math.round(this.skin.g / 3 * 2)
          imageData.data[i + 2] = Math.round(this.skin.b / 3 * 2)
        } else if (imageData.data[i] === colorOverrides.top[0].r &&
          imageData.data[i + 1] === colorOverrides.top[0].g &&
          imageData.data[i + 2] === colorOverrides.top[0].b
        ) {
          imageData.data[i] = this.clothes[0].r
          imageData.data[i + 1] = this.clothes[0].g
          imageData.data[i + 2] = this.clothes[0].b
        } else if (imageData.data[i] === colorOverrides.top[1].r &&
          imageData.data[i + 1] === colorOverrides.top[1].g &&
          imageData.data[i + 2] === colorOverrides.top[1].b
        ) {
          imageData.data[i] = Math.round(this.clothes[0].r / 2)
          imageData.data[i + 1] = Math.round(this.clothes[0].g / 2)
          imageData.data[i + 2] = Math.round(this.clothes[0].b / 2)
        } else if (imageData.data[i] === colorOverrides.pants[0].r &&
          imageData.data[i + 1] === colorOverrides.pants[0].g &&
          imageData.data[i + 2] === colorOverrides.pants[0].b
        ) {
          imageData.data[i] = this.clothes[1].r
          imageData.data[i + 1] = this.clothes[1].g
          imageData.data[i + 2] = this.clothes[1].b
        } else if (imageData.data[i] === colorOverrides.pants[1].r &&
          imageData.data[i + 1] === colorOverrides.pants[1].g &&
          imageData.data[i + 2] === colorOverrides.pants[1].b
        ) {
          imageData.data[i] = Math.round(this.clothes[1].r / 3 * 2)
          imageData.data[i + 1] = Math.round(this.clothes[1].g / 3 * 2)
          imageData.data[i + 2] = Math.round(this.clothes[1].b / 3 * 2)
        } else if (imageData.data[i] === colorOverrides.pants[2].r &&
          imageData.data[i + 1] === colorOverrides.pants[2].g &&
          imageData.data[i + 2] === colorOverrides.pants[2].b
        ) {
          imageData.data[i] = Math.round(this.clothes[1].r / 2)
          imageData.data[i + 1] = Math.round(this.clothes[1].g / 2)
          imageData.data[i + 2] = Math.round(this.clothes[1].b / 2)
        }
      }
      // put the altered data back on the canvas
      constants.helperContext.putImageData(imageData, 0, 0)

      this.sprite = new Image()
      this.sprite.src = constants.helperCanvas.toDataURL()
    }
    let spriteData = this.spriteData[this.direction][this.status]

    if (this.frame >= spriteData.length) {
      this.frame = 0
    }

    let data = spriteData[this.frame]
    this.w = data.w
    this.h = data.h

    constants[this.context].globalAlpha = data.opacity ?? 1
    if (this.protection > 0) {
      this.protection--
      constants[this.context].globalAlpha = this.protection % 2
    }
    constants[this.context].drawImage(
      this.sprite,
      data.x, data.y, this.w, this.h,
      this.x, this.y, this.w, this.h
    )
    constants[this.context].globalAlpha = 1
  }

  update = () => {
    if (CTDLGAME.lockCharacters) {

      this.draw()
      return
    }

    this.applyPhysics()
    if (this.status === 'fall') this.status = 'hurt'

    if (this.status === 'hurt' && this.vx === 0 && this.vy === 0) {
      this.status = 'idle'
    }

    const senseBox = {
      x: this.x - this.senseRadius,
      y: this.y - this.senseRadius,
      w: this.w + this.senseRadius * 2,
      h: this.h + this.senseRadius * 2
    }
    this.sensedObjects = CTDLGAME.quadTree
      .query(senseBox)
      .filter(obj => obj.id !== this.id)

    if (window.DRAWSENSORS) {
      constants.charContext.beginPath()
      constants.charContext.rect(senseBox.x, senseBox.y, senseBox.w, senseBox.h)
      constants.charContext.stroke()
    }

    if (CTDLGAME.world.map.state.protestScene) {
      this.sensedEnemies = this.sensedObjects
        .filter(enemy => enemy.class === 'PoliceForce')
        .filter(enemy => Math.abs(enemy.getCenter().x - this.getCenter().x) <= this.senseRadius)
    } else {
      this.sensedEnemies = this.sensedObjects
        .filter(enemy => enemy.enemey && enemy.health && enemy.health > 0)
        .filter(enemy => Math.abs(enemy.getCenter().x - this.getCenter().x) <= this.senseRadius)
    }

    this.sensedFriends = this.sensedObjects
      .filter(friend => /Character|Citizen/.test(friend.class) && friend.id !== this.id && friend.status !== 'rekt')
      .filter(friend => Math.abs(friend.getCenter().x - this.getCenter().x) <= this.senseRadius)

    if (Math.abs(this.vy) < 3 && !/fall|rekt|hurt/.test(this.status)) {
      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.closestFriend = getClosest(this, this.sensedFriends)
      this.bTree.step()
    }

    if (/attack/i.test(this.status)) {
      if ((CTDLGAME.frame + this.delay) % this.speed === 0) {
        this.frame++
      }
    } else if (this.status !== 'idle' || Math.random() < .05) {
      this.frame++
    }

    if (this.frame >= this.spriteData[this.direction][this.status].length) {
      this.frame = 0
      if (/action/.test(this.status)) this.status = 'idle'
    }

    this.draw()

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
  }

  say = say => {
    this.says = [{y: -8, say}]
  }

  thingsToSay = [
    ['Citizen:\nWe need open blockchains'],
    ['Citizen:\nEthereum\'s technology\nis very interesting'],
    ['Citizen:\nI can see a few interesting technologies across an\nentire ecosystem'],
    ['Citizen:\nI am not a maximalist'],
    [
      'Citizen:\nI don\'t see these systems\nas competing.',
      'Citizen:\nThey serve different niches, in my opinion.'
    ],
    [
      'Citizen:\nI want to calculate the\nprecise supply of\nfucks to give.',
      'Citizen:\nI think it might require\na script.'
    ],
    ['Citizen:\nImmutability is not a waste of energy. Christmas lights are a waste of energy']
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


  getBoundingBox = () =>this.status !== 'rekt'
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
export default Citizen