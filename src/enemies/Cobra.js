import { BehaviorTree, Selector, Sequence } from '../../node_modules/behaviortree/dist/index.node'

import cobraSprite from '../sprites/Cobra'
import { CTDLGAME } from '../gameUtils'
import { getClosest } from '../geometryUtils'
import { write } from '../font'
import { addTextToQueue } from '../textUtils'
import constants from '../constants'
import { playSound } from '../sounds'
import { sense } from './enemyUtils'
import Agent from '../Agent'

const items = [
  { id: 'pizza', chance: .05 }
]

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
    'moveToClosestEnemy'
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

class Cobra extends Agent {
  constructor(id, options) {
    super(id, options)
    this.health = options.health ?? Math.round(Math.random() * 5 + 5)
    this.item = options.item || items.find(item => item.chance >= Math.random())
    this.hadIntro = options.hadIntro
    this.canMove = options.canMove
    this.removeTimer = options.removeTimer
  }

  class = 'Cobra'
  enemy = true
  w = 14
  h = 14
  walkingSpeed = 2
  attackRange = 4
  senseRadius = 50
  spriteData = cobraSprite

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  onHurt = () => playSound('rabbitHurt')

  onDie = () => {
    this.frame = 0
    this.removeTimer = 64
    addTextToQueue('Cobra got rekt!')
  }


  update = () => {
    if (!this.sprite) this.sprite = CTDLGAME.assets.cobra

    this.applyPhysics()

    // AI logic
    if (!/rekt/.test(this.status)) {
      this.sensedEnemies = sense(this, /Character|Citizen|Rabbit/)
      this.closestEnemy = getClosest(this, this.sensedEnemies)
      this.bTree.step()
    }

    if (this.removeTimer) this.removeTimer--
    if (this.removeTimer === 0) this.remove = true

    if (!/rekt|idle/.test(this.status)) this.frame++
    if (/idle/.test(this.status) && (this.frame > 0 || Math.random() < .2)) this.frame++
    if (/rekt/.test(this.status) && this.frame < 3) this.frame++

    this.draw()

    this.dmgs = this.dmgs
      .filter(dmg => dmg.y > -24)
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
    x: this.x,
    y: this.y+ 2,
    w: this.w,
    h: this.h - 2
  })

  getAnchor = () => ({
    x: this.getBoundingBox().x,
    y: this.getBoundingBox().y + this.getBoundingBox().h - 1,
    w: this.getBoundingBox().w,
    h: 1
  })
}

export default Cobra