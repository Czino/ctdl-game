import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

import lagarde from '../sprites/lagarde'
import { addHook, CTDLGAME } from '../gameUtils'
import { intersects, getClosest } from '../geometryUtils'
import constants from '../constants'
import { addTextToQueue, setTextQueue } from '../textUtils';
import { playSound } from '../sounds';
import Agent from '../Agent'
import { random } from '../arrayUtils'
import { skipCutSceneButton } from '../events'
import { getSoundtrack, initSoundtrack } from '../soundtrack'
import BabyLizard from './BabyLizard'
import Item from '../objects/Item'

const layEgg = new Task({
  run: agent => agent.layEgg.condition() ? agent.layEgg.effect() : FAILURE
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
    layEgg,
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
    this.item = { id: 'phoenix' }
    this.strength = 5
    this.attackRange = 4
    this.senseRadius = 50
    this.protection = 0
    this.hadIntro = options.hadIntro || false
    this.canMove = options.hadIntro || false
    this.walkingSpeed = 2
    this.transformed = options.transformed
    this.eggCountdown = options.eggCountdown || 128
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

  layEgg = {
    condition: () => this.eggCountdown === 0,
    effect: () => {
      setTextQueue([])
      addTextToQueue('Lagarde:\nYou shouldn\'t put all your\neggs in one basket!')

      this.status = 'layEgg'
      CTDLGAME.objects.push(new BabyLizard(
        'babyLizard-' + CTDLGAME.frame,
        {
          x: this.x,
          y: this.y
        }
      ))
      this.eggCountdown = Math.round(Math.random() * 128)
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
      initSoundtrack('underground')
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

    if (!this.hadIntro && this.sensedEnemies.length > 0) {
      CTDLGAME.lockCharacters = true
      skipCutSceneButton.active = true
      if (getSoundtrack() !== 'lagardesIntro') initSoundtrack('lagardesIntro')

      addTextToQueue('Lagarde:\nYou\'re wasting your time\nwith Bitcoin!', () => {
        this.status = 'exhausted'
      })
      addTextToQueue('Lagarde:\nYou should be happier to\nhave a job than to have\nyour savings protected.')
      addTextToQueue('Lagarde:\nNow I have to hold you\naccountable so that you can be fully trusted.', () => {
        if (getSoundtrack() !== 'lagardesTheme') initSoundtrack('lagardesTheme')
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
    if (this.status === 'layEgg' && Math.random() < .15) {
      this.status = 'idle'
    }

    if (Math.abs(this.vy) < 3 && this.canMove && !/layEgg|exhausted|transform|fall|rekt|hurt/.test(this.status)) {
      if (getSoundtrack() !== 'lagardesTheme') initSoundtrack('lagardesTheme')

      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.closestFriend = getClosest(this, this.sensedFriends)
      this.bTree.step()
    }

    if (this.exhaustion) this.exhaustion--
    if (this.eggCountdown > 0) this.eggCountdown--
    if (this.status !== 'idle' || Math.random() < .05) {
      this.frame++
    }

    this.draw()
    if (this.transformed) {
      this.drawShell()
    }
  }

  thingsToSay = [
    ['Lagarde:\nBitcoin\'s a highly speculative asset which has conducted some funny business.'],
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
export default Lagarde