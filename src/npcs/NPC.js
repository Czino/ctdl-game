import NPCSprite from '../sprites/NPCs'
import { CTDLGAME } from "../gameUtils"
import constants from '../constants';

export default function(id, options) {
  this.id = id;
  this.class = 'NPC'
  this.applyGravity = true
  this.spriteData = NPCSprite[this.id]
  this.w = this.spriteData.frames[0].w
  this.h = this.spriteData.frames[0].h
  this.x = options.x
  this.y = options.y
  this.frame = 0
  this.isSolid = options.isSolid
  this.status = options.status
  this.info = options.info || {}

  this.update = () => {
    const data = this.spriteData.frames[this.frame]

    this.frame++
    if (this.frame >= this.spriteData.frames.length) {
      this.frame = 0
    }

    constants.gameContext.drawImage(
      CTDLGAME.assets.NPCs,
      data.x, data.y, data.w, data.h,
      this.x, this.y, this.w, this.h
    )
  }
  this.getBoundingBox = () => this

  this.getCenter = () => ({
    x: this.x + this.w / 2 - 1,
    y: this.y + this.h / 2 - 1
  })

  this.select = () => {
    if (this.spriteData.select && !this.isSelected) {
      this.isSelected = true
      this.spriteData.select(this)
    }
  }
  this.touch = () => {
    if (this.spriteData.touch && !this.isTouched) {
      this.isTouched = true
      this.spriteData.touch(this)
    }
  }
  this.unselect = () => {}

  this.toJSON = () => ({
    id: this.id,
    class: this.class,
    w: this.w,
    h: this.h,
    x: this.x,
    y: this.y
  })
}