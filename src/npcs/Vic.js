import { BehaviorTree, Selector, Task, SUCCESS, FAILURE } from '../../node_modules/behaviortree/dist/index.node'
import { CTDLGAME } from '../gameUtils'

import spriteData from '../sprites/vic'
import { addTextToQueue } from '../textUtils'
import NPC from './NPC'


const sleep = new Task({
  run: agent => agent.sleep.condition() ? agent.sleep.effect() : FAILURE
})

const close = new Task({
  run: agent => agent.close.condition() ? agent.close.effect() : FAILURE
})

const open = new Task({
  run: agent => agent.open.condition() ? agent.open.effect() : FAILURE
})

const happy = new Task({
  run: agent => agent.happy.condition() ? agent.happy.effect() : FAILURE
})

const tree = new Selector({
  nodes: [
    'idle',
    sleep,
    open,
    close,
    happy
  ]
})

class Vic extends NPC {
  constructor(id, options) {
    super(id, options)
    this.spriteId = 'vic'
    this.spriteData = spriteData
    this.w = this.spriteData[this.direction][this.status][0].w
    this.h = this.spriteData[this.direction][this.status][0].h
    this.senseRadius = 30
    this.status = options.status || 'sleep'
    this.awake = options.awake

    this.thingsToSayTouchSleep = [
      'vicariousdrama:\nCan you give me a\nlittle tug?',
      'vicariousdrama:\nI need to open up\nand sun my balls!'
    ]
    this.thingsToSaySelect = [[]]
  }

  direction = 'right'

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  idle = {
    condition: () => this.status === 'idle',
    effect: () => {
      this.status = 'idle'
      return SUCCESS
    }
  }
  sleep = {
    condition: () => this.status === 'sleep',
    effect: () => {
      this.status = 'sleep'
      return SUCCESS
    }
  }
  open = {
    condition: () => /sleep|open/.test(this.status),
    effect: () => {
      this.status = 'open'
      let spriteData = this.spriteData[this.direction][this.status]

      if (this.frame === spriteData.length) {
        this.status = 'idle'
      }
      return SUCCESS
    }
  }
  close = {
    condition: () => /idle|close/.test(this.status),
    effect: () => {
      this.status = 'close'
      let spriteData = this.spriteData[this.direction][this.status]

      if (this.frame === spriteData.length) {
        this.status = 'sleep'
      }
      return SUCCESS
    }
  }
  happy = {
    condition: () => /happy/.test(this.status),
    effect: () => {
      this.status = 'happy'
      let spriteData = this.spriteData[this.direction][this.status]

      if (this.frame === spriteData.length) {
        this.status = 'idle'
      }
      return SUCCESS
    }
  }

  update = () => {
    const senseBox = this.getSenseBox()
    this.sensedObjects = CTDLGAME.quadTree.query(senseBox)
    this.sensedFriends = this.sensedObjects
      .filter(friend => /Character|Human/.test(friend.getClass()) && friend.id !== this.id && friend.status !== 'rekt')
      .filter(friend => Math.abs(friend.getCenter().x - this.getCenter().x) <= this.senseRadius)

    this.bTree.step()

    this.draw()
    this.frame++
  }

  select = () => {
    if (this.status === 'sleep') this.status = 'open'
    if (/idle|happy/.test(this.status)) this.status = 'close'
  }

  touch = () => {
    let whatToSay = this.thingsToSayTouchSleep

    if (/happy|idle/.test(this.status)) {
      this.frame = 0
      this.status = 'happy'
      return
    }

    if (this.isTouched) return

    this.isTouched = true
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

  applyGravity = false
}
export default Vic