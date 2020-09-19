import blockSprite from './sprites/block'
import { CTDLGAME } from "./gameUtils"
import { addTextToQueue } from './textUtils'

export default function(id, context, options) {
  this.id = id;
  this.class = 'Block'
  this.spriteData = { x: 0, y: 0, w: 6, h: 6 }
  this.context = context
  this.w = options.w || 6
  this.h = options.h || 6
  this.x = options.x
  this.y = options.y
  this.isSolid = options.isSolid
  this.opacity = options.opacity || 1
  this.status = options.status
  this.info = options.info || {}

  this.toggleSolid = () => {
    this.isSolid = !this.isSolid
  }

  this.update = () => {
    let sprite = CTDLGAME.assets.block

    let data = blockSprite['block']
    if (!this.isSolid) data = blockSprite['backgroundBlock']
    if (this.info.height === 0 && this.isSolid) data = blockSprite['genesisBlock']
    if (this.info.height === 0 && !this.isSolid) data = blockSprite['genesisBackgroundBlock']
    this.context.globalAlpha = this.opacity
    this.context.drawImage(
      sprite,
      data.x, data.y, data.w, data.h,
      this.x, this.y, this.w, this.h
    )

    if (this.status === 'bad') {
      this.context.strokeStyle = '#F00'
      this.context.beginPath()
      this.context.moveTo(this.x - .5 , this.y - .5)
      this.context.lineTo(this.x - .5  + this.w, this.y - .5 + this.h)
      this.context.moveTo(this.x - .5  + this.w, this.y - .5)
      this.context.lineTo(this.x - .5 , this.y - .5 + this.h)
      this.context.stroke()
    }
  }
  this.getBoundingBox = () => this

  this.getCenter = () => ({
    x: this.x + this.w / 2 - 1,
    y: this.y + this.h / 2 - 1
  })

  this.select = () => {
    addTextToQueue(this.info.height > 0 ? 'Block: ' + this.info.height : 'Genesisblock')
  }
  this.unselect = () => {}

  this.toJSON = () => ({
    id: this.id,
    class: this.class,
    w: this.w,
    h: this.h,
    x: this.x,
    y: this.y,
    isSolid: this.isSolid,
    opacity: this.opacity,
    info: this.info
  })
}