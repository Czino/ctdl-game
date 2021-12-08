import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

import ivan from '../sprites/ivan'
import { CTDLGAME } from '../gameUtils'
import { intersects, getClosest } from '../geometryUtils'
import constants from '../constants'
import { addTextToQueue, setTextQueue } from '../textUtils'
import Agent from '../Agent'
import { random } from '../arrayUtils'
import { skipCutSceneButton } from '../eventUtils'
import Item from '../objects/Item'
import Shitcoin from '../objects/Shitcoin'
import Candle from '../objects/Candle'

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
    'lookAtEnemy',
    'attack'
  ]
})
// Sequence: runs each node until fail
const attack2Enemy = new Sequence({
  nodes: [
    'lookAtEnemy',
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


const moveToPointX = new Task({
  run: agent => {
    if (!agent.goal) agent.goal = (92 + Math.round(Math.random() * 18)) * 8
    if (Math.abs(agent.x - agent.goal) < 5) agent.goal = null
    if (!agent.goal) return FAILURE
    if (agent.x < agent.goal) return agent.moveRight.condition() ? agent.moveRight.effect() : FAILURE
    if (agent.x > agent.goal) return agent.moveLeft.condition() ? agent.moveLeft.effect() : FAILURE
    return agent.moveRandom.condition() ? agent.moveRandom.effect() : FAILURE
  }
})

const tree = new Selector({
  nodes: [
    endScene,
    hold,
    attackEnemy,
    attack2Enemy,
    wantsItem,
    moveToPointX,
    'idle'
  ]
})

class Ivan extends Agent {
  constructor(id, options) {
    super(id, options)
    this.spriteData = ivan
    this.maxHealth = 99
    this.health = options.health ?? 99
    this.usd = options.usd || Math.round(Math.random() * 80000)
    this.sats = options.sats || Math.round(Math.random() * 40000)
    this.item = { id: 'pizza' }
    this.strength = 5
    this.attackRange = 8
    this.senseRadius = 200
    this.protection = 0
    this.hadIntro = options.hadIntro || false
    this.canMove = options.hadIntro || false
    this.applyGravity = options.applyGravity || true
    this.walkingSpeed = 3
    this.pampLoaded = options.pampLoaded || 0
    this.exhaustion = options.exhaustion || 0
    if (this.status === 'rekt') {
      this.status = 'wrapped'
      this.direction = 'right'
      this.x = 692
      this.y = 343
      this.applyGravity = false
    }
  }

  enemy = true
  boss = true
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
            y: enemy.y + enemy.h + 4
          }
        ))
      }

      if (this.pampLoaded < .1) {
        this.exhaustion = 24
        this.isPamping = false
        this.status = 'exhausted'
      }
      return SUCCESS
    }
  }

  onHurt = () => {
    this.protection = 8
    window.SOUND.playSound('playerHurt')
  }

  die = agent => {
    const hodlTarantula = CTDLGAME.objects.find(obj => obj.id === 'hodlTarantula')

    if (agent.getClass() === 'HodlTarantula') {
      this.status = 'rekt'
      CTDLGAME.focusViewport = false
      hodlTarantula.killIvan = false
      window.SNDTRCK.initSoundtrack('darkIsBetter')

      addTextToQueue('hodl_tarantula:\nThanks, because of you I\ncould finally catch this\nannoying brat.')
      addTextToQueue('hodl_tarantula:\nHe was good for nothing but he will make a great dinner.')
      addTextToQueue(`${this.getClass()} got rekt,\nyou found $${this.usd}\nand ș${this.sats}`)
      if (this.usd) CTDLGAME.inventory.usd += this.usd
      if (this.sats) CTDLGAME.inventory.sats += this.sats
    } else {
      const barrier1 = CTDLGAME.objects.find(obj => obj.id === 'barrier-1')
      const barrier2 = CTDLGAME.objects.find(obj => obj.id === 'barrier-2')
  
      hodlTarantula.stayPut = false
      hodlTarantula.applyGravity = true
      hodlTarantula.killIvan = true
  
      barrier1.static = false
      barrier1.spawnCountdown = 0
      barrier2.static = false
      barrier2.spawnCountdown = 0
      CTDLGAME.focusViewport = this
      this.endScene = true
      this.pampLoaded = -9999
      this.enemy = false

      setTextQueue([])
      addTextToQueue('Ivan:\nIt\'s all dumping! I need to\nget out of here.')

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
    }
  }

  collectShitcoin = shitcoin => {
    if (shitcoin.vx || /attack|hold|exhausted/.test(this.status)) return
    shitcoin.remove = true
    shitcoin.collected = true

    this.pampLoaded += .2
    window.SOUND.playSound('item')

    if (this.pampLoaded >= 1) this.holdCountdown = 5
  }

  update = () => {
    if (!this.sprite) this.sprite = CTDLGAME.assets.ivan

    if (CTDLGAME.lockCharacters) {
      this.draw()
      return
    }

    if (!this.endScene && !this.exhaustion && !/wrapped|rekt/.test(this.status) && Math.random() < .1) {
      CTDLGAME.objects.push(new Shitcoin(
        'shitcoin-' + CTDLGAME.frame,
        {
          x: (92 + Math.round(Math.random() * 18)) * 8,
          y: 41 * 8
        }
      ))
    }

    this.applyPhysics()
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

    if (!this.exhaustion && Math.abs(this.vy) < 3 && this.canMove && !/wrapped|fall|rekt|hurt/.test(this.status)) {
      if (window.SNDTRCK.getSoundtrack() !== 'ivansTheme') window.SNDTRCK.initSoundtrack('ivansTheme')

      this.sensedItems = this.sensedObjects
      .filter(enemy => enemy.getClass() === 'Shitcoin')
      .filter(enemy => Math.abs(enemy.getCenter().x - this.getCenter().x) <= this.senseRadius)

      this.touchedObjects = this.sensedItems
        .filter(obj => obj.touch)
        .filter(obj => intersects(this.getBoundingBox(), obj.getBoundingBox()))
        .forEach(obj => obj.touch(this, this.collectShitcoin))

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