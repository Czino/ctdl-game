import NPCSprite from '../sprites/NPCs'
import { CTDLGAME } from "../gameUtils"
import constants from '../constants';
import Agent from '../Agent'

class NPC extends Agent {
  constructor(id, options) {
    super(id, options)
    this.spriteData = NPCSprite[this.id]
    this.w = this.spriteData.frames[0].w
    this.h = this.spriteData.frames[0].h
    this.frame = 0
    this.isSolid = options.isSolid
    this.status = options.status
    this.info = options.info || {}
  }

  applyGravity = true

  update = () => {
    const data = this.spriteData.frames[this.frame]

    if (!this.spriteData.static) this.frame++
    if (this.frame >= this.spriteData.frames.length) {
      this.frame = 0
    }

    constants.gameContext.drawImage(
      CTDLGAME.assets[this.spriteData.sprite || 'NPCs'],
      data.x, data.y, data.w, data.h,
      this.x, this.y, this.w, this.h
    )
  }

  select = () => {
    if (this.spriteData.select && !this.isSelected) {
      this.isSelected = true
      this.spriteData.select(this)
    }
  }
  touch = () => {
    if (this.spriteData.touch && !this.isTouched) {
      this.isTouched = true
      this.spriteData.touch(this)
    }
  }
  unselect = () => {}
}
export default NPC