import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE, RUNNING } from '../../node_modules/behaviortree/dist/index.node'

import brianSprite from '../sprites/brian'
import Item from '../Item'
import { CTDLGAME } from '../gameUtils'
import { intersects, getClosest } from '../geometryUtils'
import { write } from '../font'
import { addTextToQueue, setTextQueue } from '../textUtils'
import constants from '../constants'
import { playSound } from '../sounds'
import { getSoundtrack, initSoundtrack } from '../soundtrack';
import { senseCharacters } from './enemyUtils'
import Agent from '../Agent'

const items = [
  { id: 'pizza', chance: 0.01 },
  { id: 'taco', chance: 0.02 },
  { id: 'coldcard', chance: 0.05 },
  { id: 'opendime', chance: 1 },
]

const moveToClosestEnemy = new Task({
  run: agent => agent.closestEnemy && agent.moveTo.condition({ other: agent.closestEnemy, distance: -1 }) ? agent.moveTo.effect({ other: agent.closestEnemy, distance: -1 }) : FAILURE
})

// Sequence: runs each node until fail
const attackEnemy = new Sequence({
  nodes: [
    'touchesEnemy',
    'attack'
  ]
})

// Selector: runs until one node calls success
const goToEnemy = new Sequence({
  nodes: [
    'seesEnemy',
    'doesNotTouchEnemy',
    new Selector({
      nodes: [
        moveToClosestEnemy,
        'jump'
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

class Brian extends Agent {
  constructor(id, options) {
    super(id, options)
    this.health = options.health ?? 25
    this.usd = options.usd ?? Math.round(Math.random() * 400 + 200)
    this.item = options.item || items.find(item => item.chance >= Math.random())
    this.hadIntro = options.hadIntro || false
    this.canMove = options.hadIntro || false
    this.hurtAttackCounter = options.hurtAttackCounter || 0
  }

  class = 'Brian'
  enemy = true
  w = 16
  h = 30
  walkingSpeed = 3
  senseRadius = 60
  attackRange = 1

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  jump = {
    condition: () => this.canJump(),
    effect: () => {
      if (this.status !== 'jump') this.frame = 0
      this.status = 'jump'
      if (this.frame !== 2) return RUNNING
      this.vx = this.direction === 'right' ? 6 : -6
      this.vy = -8

      return SUCCESS
    }
  }
  attack = {
    condition: () => {
        if (!this.closestEnemy) return

        const attackBox = this.getBoundingBox()
        attackBox.x -= this.attackRange
        attackBox.w += this.attackRange * 2


        if (window.DRAWSENSORS) {
          constants.overlayContext.fillStyle = 'red'
          constants.overlayContext.fillRect(attackBox.x, attackBox.y, attackBox.w, attackBox.h)
        }

        // attack distance
        return intersects(attackBox, this.closestEnemy.getBoundingBox())
    },
    effect: () => {
      const dmg = Math.round(Math.random()) * 2 + 3

      if (this.getCenter().x > this.closestEnemy.getCenter().x) {
        this.direction = 'left'
      } else {
        this.direction = 'right'
      }

      if (this.status === 'attack' && this.frame === 3) {
        playSound('woosh')
        return this.closestEnemy.hurt(dmg, this.direction === 'left' ? 'right' : 'left', this)
      }
      if (this.status === 'attack' && this.frame < 4) return SUCCESS

      this.frame = 0
      this.status = 'attack'
      return SUCCESS
    }
  }
  hurtAttack = {
    condition: () => this.status === 'hurt' && this.hurtAttackCounter === 0,
    effect: () => {
      this.status = 'hurtAttack'

      const attackBox = this.getBoundingBox()
      attackBox.x -= this.attackRange
      attackBox.w += this.attackRange * 2

      playSound('woosh')

      this.sensedEnemies
        .filter(enemy => intersects(attackBox, enemy.getBoundingBox()))
        .forEach(enemy => {
          const dmg = Math.round(Math.random()) * 1 + 3
          const direction = this.getCenter().x > enemy.getCenter().x ? 'right' : 'left'
          enemy.hurt(dmg, direction, this)
        })

      return SUCCESS
    }
  }

  canJump = () => {
    let jumpTo = this.getBoundingBox()
    jumpTo.y -= 12
    jumpTo.x += this.direction === 'right' ? 4 : -4

    if (window.DRAWSENSORS) {
      constants.overlayContext.fillStyle = 'red'
      constants.overlayContext.fillRect(jumpTo.x, jumpTo.y, jumpTo.w, jumpTo.h)
    }
    let obstacles = CTDLGAME.quadTree.query(jumpTo)
      .filter(obj => obj.isSolid && !obj.enemy)
      .filter(obj => intersects(obj, jumpTo))

    return obstacles.length === 0
  }

  onHurt = () => playSound('shitcoinerHurt')

  hurt = dmg => {
    if (/hurt|rekt/.test(this.status)) return

    this.dmgs.push({y: -12, dmg})
    this.health = Math.max(this.health - dmg, 0)
    this.status = 'hurt'
    this.hurtAttackCounter = 6
    if (this.health <= 0) {
      this.health = 0
      return this.die()
    }

    return this.onHurt()
  }

  onDie = () => {
    this.frame = 0
    setTextQueue([])
    addTextToQueue('Brian:\nHow could this happen?', () => this.frame++)
    addTextToQueue('Brian:\nI am ruined..', () => {
      this.frame++
      playSound('drop')
    })
    addTextToQueue('Brian:\nI should have stayed\nBitcoin only...')
    addTextToQueue(`Brian got rekt,\nyou found $${this.usd}`, () => {
      initSoundtrack(CTDLGAME.world.map.track())
      CTDLGAME.objects.push(new Item(
        this.item.id,
        {
          x: this.x,
          y: this.y,
          vy: -8,
          vx: Math.round((Math.random() - .5) * 10)
        }
      ))
    })
  }

  die = () => {
    this.status = 'rekt'
    CTDLGAME.inventory.usd += this.usd

    return this.onDie()
  }

  update = () => {
    const sprite = CTDLGAME.assets.brian

    if (!sprite) return

    this.applyPhysics()

    this.sensedEnemies = senseCharacters(this)

    if (!this.hadIntro && this.sensedEnemies.length > 0) {
      CTDLGAME.lockCharacters = true
      constants.BUTTONS.find(btn => btn.action === 'skipCutScene').active = true

      setTextQueue([])
      addTextToQueue('Brian:\nWelcome to crypto!')
      addTextToQueue('Brian:\nGrab a conbase account\nwhen you\'re ready to use\nthat Bitcoin')
      addTextToQueue('Brian:\nand get into any of the\nmany other cryptos\nout there.')
      addTextToQueue('Brian:\nWhat?\nYou want to delete\nyour account?')
      addTextToQueue('Brian:\nI will delete you!', () => {
        this.canMove = true
        CTDLGAME.lockCharacters = false
        constants.BUTTONS.find(btn => btn.action === 'skipCutScene').active = false
      })
      this.hadIntro = true
    }

    if (Math.abs(this.vy) < 3 && this.canMove && !/fall|rekt|hurt/.test(this.status)) {
      if (getSoundtrack() !== 'briansTheme') initSoundtrack('briansTheme')

      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.bTree.step()
    } else if (this.hurtAttack.condition()) {
      this.hurtAttack.effect()
    }

    if (this.status === 'hurt') this.hurtAttackCounter--


    let spriteData = brianSprite[this.direction][this.status]

    if (!/hurt|rekt/.test(this.status)) this.frame++
    if (this.status === 'fall' && this.vy === 0) this.status = 'idle'

    if (this.status === 'hurtAttack' && Math.random() < .25) this.status = 'idle'

    if (this.frame >= spriteData.length) {
      this.frame = 0
      if (/jump/.test(this.status)) this.status = 'idle'
    }

    let data = spriteData[this.frame]
    this.w = data.w
    this.h = data.h

    constants.gameContext.drawImage(
      sprite,
      data.x, data.y, this.w, this.h,
      this.x, this.y, this.w, this.h
    )

    this.dmgs = this.dmgs
      .filter(dmg => dmg.y > -30)
      .map(dmg => {
        write(constants.gameContext, `-${dmg.dmg}`, {
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

  getBoundingBox = () => ({
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
        w: this.getBoundingBox().w - 5,
        h: 1
    })
    : ({
      x: this.getBoundingBox().x,
      y: this.getBoundingBox().y + this.getBoundingBox().h - 1,
      w: this.getBoundingBox().w,
      h: 1
  })

  select = () => {
    if (this.status === 'rekt') return addTextToQueue('Brian:\nLeave me alone...')
    setTextQueue([])
    addTextToQueue('Brian:\nCompliance is key to digital currencies\' success!')
  }
}

export default Brian