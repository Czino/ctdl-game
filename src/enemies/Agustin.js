import { BehaviorTree, Selector, Sequence, SUCCESS } from '../../node_modules/behaviortree/dist/index.node'

import Agent from '../Agent'
import { random } from '../arrayUtils'
import constants from '../constants'
import { skipCutSceneButton } from '../eventUtils'
import { addHook, CTDLGAME } from '../gameUtils'
import { Boundary, getClosest, intersects } from '../geometryUtils'
import Item from '../objects/Item'
import agustin from '../sprites/agustin'
import { addTextToQueue } from '../textUtils'
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
    'canAttackEnemy',
    'attack2'
  ]
})

// Selector: runs until one node calls success
const goToEnemy = new Selector({
  nodes: [
    'canAttackEnemy',
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


class Agustin extends Agent {
  constructor(id, options) {
    super(id, options)
    this.spriteData = agustin
    this.spriteId = 'agustin'
    this.maxHealth = 394
    this.startX = options.startX || options.x
    this.startY = options.startY || options.y
    this.health = options.health ?? 394
    this.usd = options.usd || Math.round(Math.random() * 8000000)
    this.item = [
      { id: 'honeybadger' },
      { id: 'phoenix' }
    ]
    this.strength = 5
    this.attackRange = 4
    this.senseRadius = 50
    this.protection = 0
    this.hadIntro = options.hadIntro || false
    this.canMove = true
    this.walkingSpeed = 2
    this.transformed = options.transformed
  }

  applyGravity = false
  enemy = true
  boss = true
  w = 52
  h = 60

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

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
        this.attackStyle = Math.random() < .5 ? 'attack1' : 'attack2'
        return SUCCESS
      }
      if (this.status === 'attack2') return SUCCESS

      this.frame = 0
      this.status = 'attack2'

      return SUCCESS
    }
  }

  hurtCondition = (dmg, direction) => !/hurt|rekt|block|/.test(this.status) && !this.protection && this.canMove

  onHurt = () => {
    this.protection = 8
  }

  die = () => {
    this.status = 'hurt'
    this.frame = 0
    this.canMove = false

    addHook(CTDLGAME.frame + 24, () => {
      this.status = 'rekt'
    })
    if (this.usd) CTDLGAME.inventory.usd += this.usd
    this.items.forEach(item => CTDLGAME.objects.push(new Item(
      item.id,
        {
          x: this.x,
          y: this.y,
          vy: -8,
          vx: Math.round((Math.random() - .5) * 10)
        }
      ))
    )

    addTextToQueue(`${this.getClass()} got rekt,\nyou found $${this.usd}`)
  }

  drawChair = () => {
    if (!this.sprite && this.spriteId) this.sprite = CTDLGAME.assets[this.spriteId]

    let data = this.spriteData.right.chair

    constants.gameContext.drawImage(
      this.sprite,
      data.x, data.y, data.w, data.h,
      this.startX, this.startY, data.w, data.h
    )
  }

  update = () => {
    if (CTDLGAME.lockCharacters) {
      if (CTDLGAME.focusViewport && CTDLGAME.focusViewport.x > this.x) CTDLGAME.focusViewport.x -= 2
      this.frame++
      this.drawChair()
      this.draw()
      return
    }

    this.applyPhysics()
    if (this.status === 'fall' && this.vy === 0) this.status = 'idle'

    if (this.status === 'hurt' && this.canMove && this.vx === 0 && this.vy === 0) {
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
    this.bankers = CTDLGAME.objects.filter(obj => obj.getClass() === 'Banker')
    if (!this.hadIntro && this.introScene) {
      CTDLGAME.objects.push(new Boundary({
        x: this.x + 50,
        y: this.y,
        h: this.h,
        w: 4
      }))
      CTDLGAME.lockCharacters = true
      CTDLGAME.focusViewport = window.SELECTEDCHARACTER.getBoundingBox()

      skipCutSceneButton.active = true


      addTextToQueue('Agustin:\nWe know that the payment has finality.', () => { this.status = 'sit' })
      addTextToQueue('Agustin:\nWhat makes an electronic\npayment to be the same...', () => { this.status = 'sitIdle' })
      addTextToQueue('Agustin:\n...to be the same as\ntransfer of the paper\nis finality.', () => { this.status = 'sit' })
      addTextToQueue('Agustin:\nAnd to the day these\ncybercurrencies don\'t\ngaruantee finality...', () => { this.status = 'sitAngry' })
      addTextToQueue('Agustin:\nHey! Who are you?', () => {
        addHook(CTDLGAME.frame + 8, () => {
          CTDLGAME.focusViewport = null
          CTDLGAME.hodlonaut.vy = -6
          CTDLGAME.hodlonaut.status = 'fall'
          CTDLGAME.hodlonaut.say('!')
          CTDLGAME.katoshi.vy = -6
          CTDLGAME.katoshi.status = 'fall'
          CTDLGAME.katoshi.say('!')
        })
        addHook(CTDLGAME.frame + 48, () => {
          CTDLGAME.hodlonaut.status = 'idle'
          CTDLGAME.katoshi.status = 'idle'
        })
      })
      addTextToQueue('Agustin:\nYou are not invited!', () => {
        CTDLGAME.focusViewport = this
        this.status = 'sitFurious'
      })
      addTextToQueue('Agustin:\nSeize them!', () => {
        this.status = 'sitAngry'
        CTDLGAME.bossFight = true
        CTDLGAME.lockCharacters = false
        skipCutSceneButton.active = false
        CTDLGAME.focusViewport = null
        this.bankers.map(banker => {
          banker.status = 'slide'
          banker.direction = 'right'
          banker.goalX = (banker.x + window.SELECTEDCHARACTER.x) / 2
        })
        this.hadIntro = true

      })
    }

    this.sensedFriends = []

    console.log(this.status, this.frame)
    if (this.status === 'expand' && this.frame === 30) {
      this.status = 'standup'
    }
    if (this.status === 'fall') {
      this.status = 'idle'
    }
    if (this.status === 'standup' && this.frame === 8) {
      this.status = 'idle'
      this.canMove = true
    }

    if (Math.abs(this.vy) < 3 && this.canMove && !/fall|rekt|hurt/.test(this.status)) {

      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.closestFriend = getClosest(this, this.sensedFriends)
      this.bTree.step()
    } else if (this.hadIntro) {
      if (Math.random() < .2) this.status = this.status === 'sitAngry' ? 'sitFurious' : 'sitAngry'
      if (!this.canMove) {
        let bankersAlive = this.bankers.some(banker => banker.status !== 'rekt')
        if (!bankersAlive) {
          // when bankers fought
          CTDLGAME.lockCharacters = true
          CTDLGAME.focusViewport = this
          addTextToQueue('Agustin:\nThat\'s the trouble with you kids, you have no idea what you are doing.', () => {})
          addTextToQueue('Agustin:\nBitcoin will break down\naltogether!', () => {})
          addTextToQueue('Agustin:\nAnd the central bank will\nhave absolute control.', () => {})
          addTextToQueue('Agustin:\nWe will have the technology to enforce that.', () => {
            this.status = 'expand'
          })
        }
      }
    }

    if (this.exhaustion) this.exhaustion--
    if (this.status !== 'idle' || Math.random() < .05) {
      this.frame++
    }

    this.drawChair()
    this.draw()
  }

  thingsToSay = [
    ['Agustin:\nBitcoin\'s a highly speculative asset which has conducted some funny business.'],
    ['Agustin:\nI will show you that I am in no way guilty of negligence.']
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
export default Agustin