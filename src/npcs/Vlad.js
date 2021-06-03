import { BehaviorTree, Selector, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'

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


let playAndMove = new Task({
  run: agent => {
    if (agent.status !== 'moveAttack') return FAILURE
    agent.x += agent.direction === 'left' ? -1 : 1
    return SUCCESS
  }
})

let keepPlaying = new Task({
  run: agent => /attack|playing/i.test(agent.status) ? SUCCESS : FAILURE
})

// Selector: runs until one node calls success
const regularBehaviour = new Selector({
  nodes: [
    'moveToPointX',
    'idle'
  ]
})


// Selector: runs until one node calls success
const play = new Selector({
  nodes: [
    justPlay,
    playAndMove,
    keepPlaying
  ]
})

const tree = new Selector({
  nodes: [
    play,
    regularBehaviour
  ]
})

class Vlad extends Agent {
  constructor(id, options) {
    super(id, options)
    this.spriteData = spriteData
    this.direction = options.direction || 'right'
    this.status = options.status ||  'attack'
    this.startX = options.startX || this.x + 3
    this.startY = options.startY || this.y + 6
    this.finishedPlaying = options.finishedPlaying
    this.endX = options.endX
    this.endY = options.endY
    this.w = this.spriteData[this.direction][this.status][0].w
    this.h = this.spriteData[this.direction][this.status][0].h
    this.thingsToSayTouch = []
    this.thingsToSaySelect = id === 'vlad-funeral' ? [] : []
  }

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  drawMic = () => {
    if (!CTDLGAME.assets.citadelBeach) return
    constants[this.context].drawImage(
      CTDLGAME.assets.citadelBeach,
      11 * 8, 4 * 8, 8, 3 * 8,
      this.startX, this.startY, 8, 3 * 8
    )
  }

  drawGuitar = () => {
    constants[this.context].drawImage(
      CTDLGAME.assets.vlad,
      20, 14, 5, 16,
      this.endX, this.endY, 5, 16
    )
  }

  update = () => {
    const spriteData = this.spriteData[this.direction][this.status]

    if (this.frame >= spriteData.length) {
      this.frame = 0
    }

    let data = spriteData[this.frame]

    this.applyPhysics()
    if (this.status === 'fall') this.status = 'idle'

    if (Math.abs(this.vy) < 3 && !/fall|rekt|hurt/.test(this.status) && this.id !== 'vlad-funeral') {
      this.bTree.step()
    }

    if (this.finishedPlaying) {
      this.drawGuitar()
    }

    constants[this.context].drawImage(
      CTDLGAME.assets.vlad,
      data.x, data.y, data.w, data.h,
      this.x, this.y, this.w, this.h
    )

    if (this.status === 'stopPlaying' && this.frame === 1) {
      this.finishedPlaying = true
      this.status = 'idle'
      this.endX = this.x + this.getBoundingBox().w - 5
      this.endY = this.y + this.getBoundingBox().h - 16
      this.applyGravity = true
      addTextToQueue('Vlad:\nDon\'t forget that you were born free.')
      addTextToQueue('Vlad:\nThis is a powerful thought\nthat will one day break all\nchains!')
    }

    if (/attack/i.test(this.status)) {
      this.drawMic()
    }

    if (this.status !== 'idle' || Math.random() < .05) {
      this.frame++
    }
  }

  applyGravity = false
}
export default Vlad