import { BehaviorTree, Selector, Task, SUCCESS, FAILURE } from 'behaviortree'
import { CTDLGAME } from '../gameUtils'

import spriteData from '../sprites/vic'
import NPC from './NPC'


const getUpWhenFriendIsNear = new Task({
  run: agent => agent.spawn.condition() ? agent.spawn.effect() : FAILURE
})

const stand = new Task({
  run: agent => agent.stand.condition() ? agent.stand.effect() : FAILURE
})

const leaveWhenFriendIsGone = new Task({
  run: agent => agent.duck.condition() ? agent.duck.effect() : FAILURE
})
const tree = new Selector({
  nodes: [
    'idle',
    leaveWhenFriendIsGone,
    stand,
    getUpWhenFriendIsNear
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

    this.thingsToSayTouch = [
      ['L1mburg3rt:\nHFSP!'],
      ['L1mburg3rt:\nOnly bitcoin matters!'],
      ['L1mburg3rt:\nFuck your shit coin!']
    ]
    this.thingsToSaySelect = [
      ['L1mburg3rt:\nCome at me!'],
      ['L1mburg3rt:\nFix The Money, Fix The World!']
    ]
  }

  direction = 'left'
  status = 'idle'

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  idle = {
    condition: () => this.sensedFriends.length === 0 && (/idle/.test(this.status) || (/duck/.test(this.status) && this.frame === 6)) ,
    effect: () => {
      this.status = 'idle'
      return SUCCESS
    }
  }
  spawn = {
    condition: () => /idle|spawn/.test(this.status) && this.sensedFriends.length > 0,
    effect: () => {
      this.status = 'spawn'
      return SUCCESS
    }
  }
  stand = {
    condition: () => /spawn/.test(this.status) && this.frame === 6,
    effect: () => {
      this.status = 'stand'
      return SUCCESS
    }
  }
  duck = {
    condition: () => /stand|duck/.test(this.status) && this.sensedFriends.length === 0,
    effect: () => {
      this.status = 'duck'
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

  applyGravity = false
}
export default Vic