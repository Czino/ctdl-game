import { BehaviorTree, Selector } from '../../node_modules/behaviortree/dist/index.node'

import prophetoshiSprite from '../sprites/prophetoshi'
import { CTDLGAME } from '../gameUtils'
import Agent from '../Agent'
import { random } from '../arrayUtils'
import { addTextToQueue } from '../textUtils'


// Selector: runs until one node calls success
const regularBehaviour = new Selector({
  nodes: [
    'moveToPointX',
    'idle'
  ]
})

const tree = new Selector({
  nodes: [
    'survive',
    regularBehaviour
  ]
})

class Prophetoshi extends Agent {
  constructor(id, options) {
    super(id, options)
    this.spriteId = 'prophetoshi'
    this.spriteData = prophetoshiSprite
    this.maxHealth = options.maxHealth ?? Math.round(Math.random() * 5) + 5
    this.health = options.health ?? this.maxHealth
    this.status = options.status || 'idle'
    this.senseRadius = this.attackRange
    this.walkingSpeed = 5
    this.business = 1
    this.thingsToSay = [
      ['Prophetoshi:\nCan\'t boil me, I\'m a sovereign frog!']
    ]
    this.goal = options.goal
  }

  w = 39
  h = 34
  applyGravity = true

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  update = () => {
    if (CTDLGAME.lockCharacters) {
      this.draw()
      return
    }

    this.applyPhysics()

    if (Math.abs(this.vy) < 3 && !/fall|rekt|hurt/.test(this.status)) {
      this.bTree.step()
    }

    this.draw()
  }

  touch = () => {
    if (!this.thingsToSay || this.isTouched) return
    this.isTouched = true

    let whatToSay = random(this.thingsToSay)
      whatToSay.map((text, index) => {
        if (index === whatToSay.length - 1) {
          addTextToQueue(text, () => {
            this.isTouched = false
          })
        } else {
          addTextToQueue(text)
        }
      })
  }
}
export default Prophetoshi