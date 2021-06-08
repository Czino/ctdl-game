import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

import spriteData from '../sprites/vlad'
import Agent from '../Agent'
import { addTextToQueue } from '../textUtils'
import { senseCharacters } from '../enemies/enemyUtils'

let isOutside = new Task({
  run: agent => agent.context !== 'parallaxContext' ? SUCCESS : FAILURE
})
let seesCharacters = new Task({
  run: agent => agent.sensedCharacters.length > 0 ? SUCCESS : FAILURE
})

let talk = new Task({
  run: agent => {
    if (agent.hasTalked) return SUCCESS
    agent.hasTalked = true
    addTextToQueue('Snake ₿itken:\n', () => agent.moveToElevator = true)
  }
})
let moveToElevator = new Task({
  run: agent => {
    if (agent.movedToElevator) return SUCCESS
    
    if (agent.x > 6 * 8) agent.movedToElevator = true
    return agent.moveRight.condition() ? agent.moveRight.effect() : FAILURE
  }
})
let pressButton = new Task({
  run: agent => {
    if (agent.pressedButton) return SUCCESS
    
    return agent.action.condition() ? agent.action.effect() : FAILURE
  }
})

// Selector: runs until one node calls success
const regularBehaviour = new Selector({
  nodes: [
    'idle'
  ]
})

const robberyScene = new Sequence({
  nodes: [
    isOutside,
    seesCharacters,
    talk,
    moveToElevator,
    pressButton
  ]
})

const tree = new Selector({
  nodes: [
    regularBehaviour,
    robberyScene
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
    this.hasTalked = options.hasTalked
    this.moveToElevator = options.moveToElevator
    this.movedToElevator = options.movedToElevator
  }

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })


  update = () => {
    this.applyPhysics()
    let sensedCharacters = senseCharacters(this)

    this.bTree.step()

    this.draw()

    if (this.gone) {
      CTDLGAME.world.map.state.codeRed = true
    }
  }

  applyGravity = false
}
export default SnakeBitken