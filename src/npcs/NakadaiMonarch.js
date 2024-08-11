import { BehaviorTree, FAILURE, SUCCESS, Selector, Sequence, Task } from '../../node_modules/behaviortree/dist/index.node'

import Agent from '../Agent'
import constants from '../constants'
import { CTDLGAME } from '../gameUtils'
import { getClosest, intersects } from '../geometryUtils'
import spriteData from '../sprites/nakadaiMonarch'
import { addTextToQueue } from '../textUtils'

const sit = new Task({
  run: agent => agent.sit.condition() ? agent.sit.effect() : FAILURE
})
// Sequence: runs each node until fail
const attackEnemy = new Sequence({
  nodes: [
    'lookAtEnemy',
    'canAttackEnemy',
    'attack'
  ]
})

// Selector: runs until one node calls success
const goToEnemy = new Sequence({
  nodes: [
    'seesEnemy',
    'doesNotTouchEnemy',
    'moveToClosestEnemy'
  ]
})

// Selector: runs until one node calls success
const regularBehaviour = new Selector({
  nodes: [
    attackEnemy,
    goToEnemy,
    'moveRandom',
    'idle'
  ]
})


const tree = new Selector({
  nodes: [
    sit,
    'survive',
    regularBehaviour
  ]
})

class NakadaiMonarch extends Agent {
  constructor(id, options) {
    super(id, options)
    this.spriteId = 'nakadaiMonarch'
    this.spriteData = spriteData
    this.maxHealth = options.maxHealth ?? 99999
    this.health = options.health ?? this.maxHealth
    this.strength = 8
    this.exhaustion = options.exhaustion || 0
    this.exhausted = options.exhausted
    this.status = options.status || 'sit'
    this.attackRange = 4
    this.senseRadius = 110
    this.walkingSpeed = options.walkingSpeed || 2
    this.protection = 0

    CTDLGAME.nakadaiMon = this
  }

  w = 20
  h = 30
  applyGravity = true
  follow = true

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  idle = {
    condition: () => true,
    effect: () => {
      this.status = 'idle'
      this.exhaustion -= .5
      return SUCCESS
    }
  }
  sit = {
    condition: () => !this.follow,
    effect: () => {
      this.status = 'sit'
      this.exhaustion -= 1
      return SUCCESS
    }
  }
  attack = {
    condition: () => {
      if (!this.closestEnemy) return FAILURE

      if (!this.closestEnemy || !intersects(this.getBoundingBox(), this.closestEnemy.getBoundingBox())) return FAILURE // not in biting distance

      return SUCCESS
    },
    effect: () => {
      if (this.status === 'attack' && this.frame === 4) {
        window.SOUND.playSound('sword')

        this.closestEnemy.hurt(this.strength || 1, this.direction === 'left' ? 'right' : 'left', this)
        return SUCCESS
      }
      if (this.status === 'attack') return SUCCESS

      this.frame = 0
      this.status = 'attack'

      return SUCCESS
    }
  }

  update = () => {
    if (CTDLGAME.lockCharacters) {
      this.draw()
      return
    }

    this.applyPhysics()

    if (/stun|hurt/.test(this.status) && this.vx === 0 && this.vy === 0) this.status = 'idle'

    this.exhaustion = Math.max(0, this.exhaustion)

    const senseBox = this.getSenseBox()
    this.sensedObjects = CTDLGAME.quadTree.query(senseBox)

    this.touchedObjects = CTDLGAME.quadTree
      .query(this.getBoundingBox())
      .filter(obj => intersects(this.getBoundingBox(), obj.getBoundingBox()))

    this.sensedObjects = CTDLGAME.quadTree.query(senseBox)

    if (window.DRAWSENSORS) {
      constants.charContext.beginPath()
      constants.charContext.rect(senseBox.x, senseBox.y, senseBox.w, senseBox.h)
      constants.charContext.stroke()
    }

    this.sensedEnemies = this.sensedObjects
      .filter(enemy => enemy.enemy && enemy.status !== 'rekt' && enemy.health > 0)
      .filter(enemy => intersects(senseBox, enemy))

    
    this.sensedFriends = this.sensedObjects
      .filter(friend => /Character/.test(friend.getClass()) && friend.id !== this.id && friend.status !== 'rekt')
      .filter(friend => intersects(senseBox, friend))

    if (Math.abs(this.vy) < 3 && !/fall/.test(this.status)) {
      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.closestFriend = getClosest(this, this.sensedFriends)
      this.bTree.step()
    }

    if (this.status !== 'idle' || Math.random() < .05) {
      this.frame++
    }

    if (this.frame >= this.spriteData[this.direction][this.status].length) {
      this.frame = 0
    }

    this.draw()
  }

  select = () => {
    const talkRadius = this.getBoundingBox()
    talkRadius.x -= 16
    talkRadius.w += 32

    if (CTDLGAME.inventory.citadelOneMembership) {
      if (CTDLGAME.world.id === 'pier') {
        addTextToQueue('nakadai.MONARCH:\nLFG!', () => {
          const ferry = CTDLGAME.objects.find(obj => obj.id === 'ferry')

          if (CTDLGAME.hodlonaut.selected) {
            CTDLGAME.katoshi.x = CTDLGAME.hodlonaut.x + 8
            CTDLGAME.katoshi.y = CTDLGAME.hodlonaut.y
          }
          if (CTDLGAME.katoshi.selected) {
            CTDLGAME.hodlonaut.x = CTDLGAME.katoshi.x + 8
            CTDLGAME.hodlonaut.y = CTDLGAME.katoshi.y
          }
          ferry.drive(1)
          this.isSelected = false
        })
      } else {
        addTextToQueue('nakadai.MONARCH:\nYou have a heart like Bitcoin. Don\'t let them take it from you.', () => {
          this.isSelected = false
        })
      }
      return
    }

    if (!intersects(window.SELECTEDCHARACTER.getBoundingBox(), talkRadius)) {
      addTextToQueue('nakadai.MONARCH:\nI can\'t here you from over\nthere! Come closer!')
      return
    }
    addTextToQueue('nakadai.MONARCH:\nI can take you to\nCitadel One, yes...')
    addTextToQueue('nakadai.MONARCH:\nBut first you must put skin in the game to become a\nmember.', () => {
      CTDLGAME.prompt = {
        text: 'nakadai.MONARCH:\nI need you to put ₿0.5 in our multisig address.\nWill you pay?',
        payload: this,
        ok: () => {
          if (CTDLGAME.inventory.sats >= 50000000) {
            CTDLGAME.inventory.sats -= 50000000
            CTDLGAME.inventory.citadelOneMembership = true
            addTextToQueue('nakadai.MONARCH:\nHappy to have you on board.\nLFG!', () => {
              const ferry = CTDLGAME.objects.find(obj => obj.id === 'ferry')
              ferry.drive(2)

              if (CTDLGAME.hodlonaut.selected) {
                CTDLGAME.katoshi.x = CTDLGAME.hodlonaut.x + 8
                CTDLGAME.katoshi.y = CTDLGAME.hodlonaut.y
              }
              if (CTDLGAME.katoshi.selected) {
                CTDLGAME.hodlonaut.x = CTDLGAME.katoshi.x + 8
                CTDLGAME.hodlonaut.y = CTDLGAME.katoshi.y
              }

              this.isSelected = false
            })
          } else {
            addTextToQueue('nakadai.MONARCH:\nCome back when\nyou have the money', () => {
              this.isSelected = false
            })
          }
        },
        cancel: () => {
          addTextToQueue('nakadai.MONARCH:\nCome back when\nyou are serious.', () => {
            this.isSelected = false
          })
        }
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
}
export default NakadaiMonarch