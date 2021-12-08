import { BehaviorTree, Selector, Sequence, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

import spriteData from '../sprites/snakeBitken'
import Agent from '../Agent'
import { addTextToQueue } from '../textUtils'
import { senseCharacters } from '../enemies/enemyUtils'
import { addHook, CTDLGAME } from '../gameUtils'
import Item from '../objects/Item'

const isOutside = new Task({
  run: agent => agent.context !== 'parallaxContext' ? SUCCESS : FAILURE
})
const seesCharacters = new Task({
  run: agent => agent.sensedCharacters.length > 0 ? SUCCESS : FAILURE
})

const talk = new Task({
  run: agent => {
    if (agent.moveToElevator) return SUCCESS
    if (!agent.hasTalked) {
      CTDLGAME.focusViewport = agent
      CTDLGAME.lockCharacters = true
      addTextToQueue('Snake ₿itken:\nTime to disappear.', () => agent.moveToElevator = true)
      agent.hasTalked = true
    }
    return FAILURE
  }
})
const moveToElevator = new Task({
  run: agent => {
    if (!agent.movedToElevator && agent.moveRight.condition()) {
      agent.moveRight.effect()
    }
    if (agent.x > 5 * 8) agent.movedToElevator = true
    return agent.movedToElevator ? SUCCESS : FAILURE
  }
})


const throwItem = new Task({
  run: agent => {
    if (agent.threwItem) return SUCCESS
    if (agent.status === 'stand' && !agent.threwItem) return FAILURE
    agent.status = 'stand'
    addTextToQueue('Snake ₿itken:\nI have no use for\nthis anymore.\nKnock yourself out.', () => {
      agent.threwItem = true
      CTDLGAME.objects.push(new Item(
        'securityCard',
        {
          x: agent.x,
          y: agent.y,
          vy: -4,
          vx: 6
        }
      ))
    })

    return FAILURE
  }
})
const pressButton = new Task({
  run: agent => {
    if (agent.pressedButton) return SUCCESS

    window.KEYS = ['npc']
    agent.pressedButton = true

    return SUCCESS
  }
})

const robberyScene = new Sequence({
  nodes: [
    isOutside,
    seesCharacters,
    talk,
    moveToElevator,
    throwItem,
    pressButton,
  ]
})

const tree = new Selector({
  nodes: [
    robberyScene,
  ]
})

class SnakeBitken extends Agent {
  constructor(id, options) {
    super(id, options)
    this.spriteData = spriteData
    this.spriteId = 'snakeBitken'
    this.direction = options.direction || 'right'
    this.status = options.status || 'idle'
    this.w = this.spriteData[this.direction][this.status][0].w
    this.h = this.spriteData[this.direction][this.status][0].h
    this.senseRadius = 60
    // this.hasTalked = options.hasTalked
    // this.moveToElevator = options.moveToElevator
    // this.movedToElevator = options.movedToElevator
    // this.threwItem = options.threwItem
  }

  applyGravity = true

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  update = () => {
    this.applyPhysics()
    this.sensedCharacters = senseCharacters(this)

    if (!this.pressedButton) {
      this.bTree.step()
    } else {
      let spriteData = this.spriteData[this.direction].action
      CTDLGAME.focusViewport = null
      
      window.KEYS = window.KEYS.filter(key => key !== 'npc')
      if (this.frame === spriteData.length) {
        this.frame = 0
        this.status = 'stand'
        addHook(CTDLGAME.frame + 42 * 8, () => {
          CTDLGAME.lockCharacters = false
          this.remove = true
          CTDLGAME.world.map.state.codeRed = true
        })
      }
    }

    this.draw()
    this.frame++
    
    if (this.gone) {
      CTDLGAME.world.map.state.codeRed = true
      CTDLGAME.world.map.spawnRates.policeForce = 0.01
      CTDLGAME.world.map.spawnRates.citizen = 0
    }
  }

  applyGravity = false
}
export default SnakeBitken