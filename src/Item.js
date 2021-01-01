import constants from './constants'
import { CTDLGAME } from './gameUtils'
import { moveObject } from './geometryUtils';
import spriteData from './sprites/items'
import { playSound } from './sounds';
import { addTextToQueue } from './textUtils';

// TODO add steak that fully heals you
export default function(id, options) {
  this.id = id;
  this.class = 'Item'
  this.applyGravity = options.applyGravity ?? true
  this.spriteData = spriteData[this.id]

  this.w = this.spriteData.w
  this.h = this.spriteData.h
  this.x = options.x
  this.y = options.y
  this.vx = options.vx || 0
  this.vy = options.vy || 0
  this.collected = false

  const sprite = CTDLGAME.assets.items

  this.touch = character => {
    if (this.collected || this.vy < 0) return
    this.remove = true
    this.collected = true
    
    if (this.id === 'pizza') {
      character.heal(2)
      playSound('item')
    } else if (this.id === 'taco') {
      character.heal(5)
      playSound('item')
    } else if (this.id === 'opendime') {
      let sats = Math.round(Math.random() * 10000)
      addTextToQueue(`You found an opendime with\nś${sats}`, () => {
        CTDLGAME.inventory.sats += sats
      })
      playSound('item')
    } else if (this.id === 'coldcard') {
      let sats = Math.round(Math.random() * 100000)
      addTextToQueue(`You found a coldcard with\nś${sats}`, () => {
        CTDLGAME.inventory.sats += sats
      })
      playSound('item')
    } else if (this.id === 'honeybadger') {
      addTextToQueue('You gained the strength\nof the honey badger')
      character.strength += Math.round(Math.random() + 1)
      character.maxHealth += Math.round(Math.random() * 3 + 1)
      character.heal(character.maxHealth)
      playSound('honeyBadger')
    } else if (this.id === 'orangePill') {
      addTextToQueue('The orange pill makes\nyou more vital')
      character.maxHealth += Math.round(Math.random() * 3 + 1)
      character.heal(Math.round(character.maxHealth / 2))
      playSound('honeyBadger')
    } else if (this.id === 'phoenix') {
      if (CTDLGAME.inventory.phoenix >= 2) {
        this.remove = false
        this.collected = false
      } else {
        addTextToQueue('Like the Phoenix, you\'ll rise\nfrom the ashes.')
        CTDLGAME.inventory.phoenix++
        playSound('honeyBadger')
      }
    }
  }
  this.update = () => {
    if (this.vx !== 0) {
      if (this.vx > 18) this.vx = 18
      if (this.vx < -18) this.vx = -18
      moveObject(this, { x: this.vx , y: 0 }, CTDLGAME.quadTree)
      if (this.vx < 0) this.vx += 1
      if (this.vx > 0) this.vx -= 1
    }

    if (this.vy !== 0) {
      if (this.vy > 6) this.vy = 6
      if (this.vy < -6) this.vy = -6
      const hasCollided = moveObject(this, { x: 0 , y: this.vy }, CTDLGAME.quadTree)

      if (hasCollided) {
        this.vy = 0
      }
    }
    constants.gameContext.drawImage(
      sprite,
      this.spriteData.x, this.spriteData.y, this.spriteData.w, this.spriteData.h,
      this.x, this.y + Math.round(Math.sin(CTDLGAME.frame / 16)), this.w, this.h
    )
  }

  this.getBoundingBox = () => ({
    id: this.id,
    x: this.x,
    y: this.y,
    w: this.w,
    h: this.h
  })

  this.getCenter = () => ({
    x: Math.round(this.x + this.w / 2),
    y: Math.round(this.y + this.h / 2)
  })

  this.getAnchor = () => ({
      x: this.getBoundingBox().x,
      y: this.getBoundingBox().y + this.getBoundingBox().h,
      w: this.getBoundingBox().w,
      h: 1
  })


  this.select = () => {}

  this.toJSON = () => ({
    id: this.id,
    class: this.class,
    w: this.w,
    h: this.h,
    x: this.x,
    y: this.y,
    vx: this.vx,
    vy: this.vy
  })
}