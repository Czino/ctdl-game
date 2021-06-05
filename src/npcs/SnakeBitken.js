import { BehaviorTree, Selector, Task, SUCCESS, FAILURE } from 'behaviortree'

import constants from '../constants'
import { CTDLGAME } from '../gameUtils'
import spriteData from '../sprites/vlad'
import Agent from '../Agent'
import { addTextToQueue } from '../textUtils'

let justPlay = new Task({
  run: agent => {
    if (agent.status !== 'attack') return FAILURE
    return agent.attack.condition() ? agent.attack.effect() : FAILURE
  }
})

// Selector: runs until one node calls success
const regularBehaviour = new Selector({
  nodes: [
    'idle'
  ]
})


const tree = new Selector({
  nodes: [
    regularBehaviour
  ]
})

class SnakeBitken extends Agent {
  constructor(id, options) {
    super(id, options)
    this.spriteData = spriteData
    this.spriteId = 'snakeBitken'
    this.direction = options.direction || 'right'
    this.status = options.status ||  'idle'
    this.w = this.spriteData[this.direction][this.status][0].w
    this.h = this.spriteData[this.direction][this.status][0].h
  }

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })


  update = () => {
    this.applyPhysics()

    if (Math.abs(this.vy) < 3 && !/fall|rekt|hurt/.test(this.status) && this.context !== 'parallaxContext') {
      this.bTree.step()
    }

    this.draw()
  }

  applyGravity = false
}
export default SnakeBitken