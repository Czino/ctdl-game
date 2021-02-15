import { BehaviorTree, Selector, Sequence, SUCCESS } from '../../node_modules/behaviortree/dist/index.node'

import lagarde from '../sprites/lagarde'
import { CTDLGAME } from '../gameUtils'
import { intersects, getClosest } from '../geometryUtils'
import constants from '../constants'
import { addTextToQueue } from '../textUtils';
import { playSound } from '../sounds';
import Agent from '../Agent'
import { random } from '../arrayUtils'
import { skipCutSceneButton } from '../events'
import { getSoundtrack, initSoundtrack } from '../soundtrack'

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

// Selector: runs until one node calls success
const goToEnemy = new Selector({
  nodes: [
    'touchesEnemy',
    'moveToClosestEnemy'
  ]
})
const tree = new Selector({
  nodes: [
    attackEnemy,
    attack2Enemy,
    goToEnemy,
    'moveToPointX',
    'idle'
  ]
})


class Lagarde extends Agent {
  constructor(id, options) {
    super(id, options)
    this.startX = options.startX || options.x
    this.startY = options.startY || options.y
    this.startDirection = options.startDirection || this.direction
    this.spriteData = lagarde
    this.maxHealth = 394
    this.health = options.health ?? 394
    this.usd = options.usd || Math.round(Math.random() * 8000000)
    this.item = { id: 'pizza' }
    this.strength = 5
    this.attackRange = 4
    this.senseRadius = 50
    this.protection = 0
    this.hadIntro = options.hadIntro || false
    this.canMove = options.hadIntro || false
    this.walkingSpeed = 2
    this.transformed = options.transformed
  }

  enemy = false
  w = 16
  h = 30

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  attack = {
    condition: () => {
      if (!this.closestEnemy || this.attackStyle === 'attack2') return false

      if (!this.closestEnemy || !intersects(this.getBoundingBox(), this.closestEnemy.getBoundingBox())) return false

      return true
    },
    effect: () => {
      if (this.status === 'attack' && this.frame === 4) {
        this.closestEnemy.hurt(this.strength, this.direction === 'left' ? 'right' : 'left', this)
        this.attackStyle = Math.random() < .5 ? 'attack1' : 'attack2'
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
      console.log('attack2')
      if (!this.closestEnemy || this.attackStyle === 'attack1') return false

      if (!this.closestEnemy || !intersects(this.getBoundingBox(), this.closestEnemy.getBoundingBox())) return false

      return true
    },
    effect: () => {
      if (this.status === 'attack2' && this.frame === 4) {
        this.closestEnemy.hurt(this.strength, this.direction === 'left' ? 'right' : 'left', this)
        this.attackStyle = Math.random() < .5 ? 'attack1' : 'attack2'
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
    playSound('enemyHurt')
  }

  drawShell = () => {
    let data = this.spriteData[this.startDirection].shell[0]

    constants[this.context].drawImage(
      this.sprite,
      data.x, data.y, data.w, data.h,
      this.startX, this.startY, data.w, data.h
    )
  }

  update = () => {
    if (!this.sprite) this.sprite = CTDLGAME.assets.lagarde

    if (CTDLGAME.lockCharacters) {
      this.frame++
      this.draw()
      return
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

      addTextToQueue('Lagarde:\nYou\'re wasting your time\nwith Bitcoin!', () => {
        this.status = 'exhausted'
      })
      addTextToQueue('Lagarde:\nYou should be happier to\nhave a job than to have\nyour savings protected.')
      addTextToQueue('Lagarde:\nNow I have to hold you\naccountable so that you can be fully trusted.', () => {
        this.status = 'transform'
        CTDLGAME.bossFight = true
        CTDLGAME.lockCharacters = false
        skipCutSceneButton.active = false
      })
      this.hadIntro = true
    }

    this.sensedFriends = []

    if (this.status === 'transform' && this.frame === 8) {
      this.status = 'idle'
      this.transformed = true
      this.canMove = true
    }

    if (Math.abs(this.vy) < 3 && this.canMove && !/exhausted|transform|fall|rekt|hurt/.test(this.status)) {
      if (getSoundtrack() !== 'lagardesTheme') initSoundtrack('lagardesTheme')

      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.closestFriend = getClosest(this, this.sensedFriends)
      this.bTree.step()
    }

    if (this.exhaustion) this.exhaustion--

    if (this.status !== 'idle' || Math.random() < .05) {
      this.frame++
    }

    if (this.frame >= this.spriteData[this.direction][this.status].length) {
      this.frame = 0
    }

    this.draw()
    if (this.transformed) {
      this.drawShell()
    }
  }

  thingsToSay = [
    ['Lagarde:\nBitcoin is a highly speculative asset which has conducted some funny business.'],
    ['Lagarde:\nI will show you that I am in no way guilty of negligence.']
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
export default Lagarde