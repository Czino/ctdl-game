import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE, RUNNING } from '../../node_modules/behaviortree/dist/index.node'

import ivan from '../sprites/ivan'
import { CTDLGAME } from '../gameUtils'
import { moveObject, intersects, getClosest } from '../geometryUtils'
import constants from '../constants'
import { addTextToQueue, setTextQueue } from '../textUtils';
import { playSound } from '../sounds';
import Agent from '../Agent'
import { random } from '../arrayUtils'
import { skipCutSceneButton } from '../events'
import { getSoundtrack, initSoundtrack } from '../soundtrack'
import Item from '../Item';
import Shitcoin from '../objects/Shitcoin'
import Candle from '../objects/Candle'

const lookAtEnemy = new Task({
  run: agent => agent.closestEnemy && agent.lookAt.condition(agent.closestEnemy) ? agent.lookAt.effect(agent.closestEnemy) : FAILURE
})
const lookAtItem = new Task({
  run: agent => agent.closestItem && agent.lookAt.condition(agent.closestItem) ? agent.lookAt.effect(agent.closestItem) : FAILURE
})
const hold = new Task({
  run: agent => agent.hold.condition() ? agent.hold.effect() : FAILURE
})
const endScene = new Task({
  run: agent => agent.endScene
    ? agent.moveLeft.condition() ? agent.moveLeft.effect() : FAILURE
    : FAILURE
})

// Sequence: runs each node until fail
const attackEnemy = new Sequence({
  nodes: [
    lookAtEnemy,
    'attack'
  ]
})
// Sequence: runs each node until fail
const attack2Enemy = new Sequence({
  nodes: [
    lookAtEnemy,
    'attack2'
  ]
})

// Selector: runs until one node calls success
const wantsItem = new Sequence({
  nodes: [
    'seesItem',
    lookAtItem,
    new Selector({
      nodes: [
        'move'
      ]
    })
  ]
})


// walks around randomly
// wants to collect shitcoins
// you can destroy shitcoins before he gets them
// when he collected enough shitcoins he can start a PAMP
// when he collected enough shitcoins he can also just throw them at you

const tree = new Selector({
  nodes: [
    endScene,
    hold,
    attackEnemy,
    attack2Enemy,
    wantsItem,
    'idle'
  ]
})

class Ivan extends Agent {
  constructor(id, options) {
    super(id, options)
    this.spriteData = ivan
    this.maxHealth = 99
    this.health = options.health ?? 99
    this.usd = options.usd || Math.round(Math.random() * 10000)
    this.item = { id: 'pizza' }
    this.strength = 5
    this.attackRange = 8
    this.senseRadius = 200
    this.protection = 0
    this.hadIntro = options.hadIntro || false
    this.canMove = options.hadIntro || false
    this.walkingSpeed = 3
    this.pampLoaded = options.pampLoaded || 0
    this.exhaustion = options.exhaustion || 0
  }

  enemy = true
  says = []
  w = 16
  h = 30

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  attack = {
    condition: () => this.closestEnemy
      && Math.random() < .03 && this.pampLoaded > .1
      && Math.abs(this.closestEnemy.x - this.x) > 24,
    effect: () => {
      if (!/attack/i.test(this.status)) {
        setTextQueue([])
        addTextToQueue('Ivan:\nCheck out this\nsecret gem!')
        this.frame = 0
        this.pampLoaded -= .1
      }
      this.status = 'attack'

      CTDLGAME.objects.push(new Shitcoin(
        'shitcoin-' + CTDLGAME.frame,
        {
          x: this.direction === 'left' ? this.x : this.x + this.getBoundingBox().w,
          y: this.getBoundingBox().y,
          health: 1,
          applyGravity: false,
          vx: this.direction === 'left' ? - 5 : 5
        }
      ))
      return SUCCESS
    }
  }


  hold = {
    condition: () => this.holdCountdown,
    effect: () => {
      if (!/hold/i.test(this.status)) this.frame = 0

      if (!this.isPamping) {
        setTextQueue([])
        addTextToQueue('Ivan:\nRespect the PAMP!')
      }
      this.status = 'hold'

      this.isPamping = true
      this.holdCountdown--
      return SUCCESS
    }
  }

  attack2 = {
    condition: () => this.isPamping || this.pampLoaded >= 1,
    effect: () => {
      if (!/attack/i.test(this.status)) this.frame = 0
      this.status = 'attack'

      this.isPamping = this.pampLoaded > 0
      if (Math.random() < .3) return SUCCESS
      this.pampLoaded -= .1

      let enemy = random(this.sensedEnemies)
      if (enemy) {
        CTDLGAME.objects.push(new Candle(
          'candle-' + CTDLGAME.frame,
          {
            x: enemy.x + Math.round((Math.random() - .5) * 8),
            y: enemy.y + enemy.h
          }
        ))
      }

      if (this.pampLoaded < .1) {
        this.exhaustion = 24
        this.status = 'exhausted'
      }
      return SUCCESS
    }
  }

  onHurt = agent => {
    this.protection = 8
    playSound('playerHurt')

    if (agent.getClass() === 'hodlTarantula') {
      this.status = 'rekt'
    }
  }

  die = () => {
    // TODO go to hodl_tarantula and get rekt
    this.endScene = true
  }

  collectShitcoin = shitcoin => {
    if (shitcoin.vx) return
    shitcoin.remove = true
    shitcoin.collected = true

    this.pampLoaded += .2

    if (this.pampLoaded >= 1) this.holdCountdown = 5
  }

  update = () => {
    if (!this.sprite) this.sprite = CTDLGAME.assets.ivan

    if (CTDLGAME.lockCharacters) {
      this.draw()
      return
    }

    if (this.status !== 'rekt' && Math.random() < .05) {
      CTDLGAME.objects.push(new Shitcoin(
        'shitcoin-' + CTDLGAME.frame,
        {
          x: (92 + Math.round(Math.random() * 18)) * 8,
          y: 41 * 8
        }
      ))
    }

    this.applyPhysics()
    if (this.status === 'fall' && this.id === 'ivan') CTDLGAME.lightningTorch = null
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
      .filter(enemy => enemy.getClass() === 'Shitcoin')
      .filter(enemy => Math.abs(enemy.getCenter().x - this.getCenter().x) <= this.senseRadius)

    this.touchedObjects = this.sensedItems
      .filter(obj => obj.touch)
      .filter(obj => intersects(this.getBoundingBox(), obj.getBoundingBox()))
      .forEach(obj => obj.touch(this, this.collectShitcoin))

    if (!this.hadIntro && this.sensedEnemies.length > 0) {
      CTDLGAME.lockCharacters = true
      skipCutSceneButton.active = true

      addTextToQueue('Ivan:\nThe pumpamentals are\nstrong, I smell it!')
      addTextToQueue('Ivan:\nA storm is brewing as\nwe are speaking!')
      addTextToQueue('Ivan:\nGoguen is bringing us the\npower of the pamp, I can\nonly respect it.', () => {
        this.canMove = true
        CTDLGAME.bossFight = true
        CTDLGAME.lockCharacters = false
        skipCutSceneButton.active = false
      })
      this.hadIntro = true
    }

    this.sensedFriends = []

    if (!this.exhaustion && Math.abs(this.vy) < 3 && this.canMove && !/jump|fall|rekt|hurt/.test(this.status)) {
      if (getSoundtrack() !== 'ivansTheme') initSoundtrack('ivansTheme')

      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.closestFriend = getClosest(this, this.sensedFriends)
      this.closestItem = getClosest(this, this.sensedItems)
      this.bTree.step()
    }

    if (this.exhaustion) this.exhaustion--

    if (this.status !== 'idle' || Math.random() < .05) {
      this.frame++
    }

    if (this.frame >= this.spriteData[this.direction][this.status].length) {
      this.frame = 0
      if (/jump|action/.test(this.status)) this.status = 'idle'
    }

    this.draw()
  }

  say = say => {
    this.says = [{y: -8, say}]
  }

  thingsToSay = [
    ['Ivan:\nSmash the like!']
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
export default Ivan