import { write } from "./font"
import { drawPolygon } from "./geometryUtils"
import constants from "./constants"

function moveBlock(block, vector) {
  if (block.isStatic) return block

  let result = quadTree.query(block)
  let wouldCollide = result
    .filter(otherBlock => otherBlock.id !== block.id)
    .some(otherBlock => {
      let ghostBlock = {
        ...block,
        x: block.x + vector.x,
        y: block.y + vector.y,
      }

      return !(ghostBlock.x > otherBlock.x + otherBlock.w ||
        ghostBlock.x + ghostBlock.w < otherBlock.x ||
        ghostBlock.y > otherBlock.y + otherBlock.h ||
        ghostBlock.y + ghostBlock.h < otherBlock.y)
    })

  if (wouldCollide) {
    block.idle++

    if (block.idle > 10) block.isStatic = true
    return block
  }
  block.idle = 0

  constants.gameContext.clearRect(block.x, block.y, block.w, block.h)
  block = {
    ...block,
    x: block.x + vector.x,
    y: block.y + vector.y,
  }
  renderBlock(block)

  return block;
}

export default function(id, context, quadTree, options) {
  this.id = id;
  this.class = 'Block'
  this.spriteData = { x: 0, y: 0, w: 6, h: 6 }
  this.quadTree = quadTree
  this.context = context
  this.w = options.w || 6
  this.h = options.h || 6
  this.x = options.x
  this.y = options.y
  this.isStatic = options.isStatic
  this.isSolid = options.isSolid
  this.opacity = options.opacity || 1
  this.status = options.status
  this.info = options.info

  this.update = () => {
    let sprite = window.CTDLGAME.assets[this.id === 'ground' ? 'ground' : 'block']
    if (this.id === 'ground') {
      this.context.fillStyle = this.context.createPattern(sprite, 'repeat')

      this.context.fillRect(this.x, this.y, this.w, this.h)
      return
    } else {
      if (this.info.height === 0) sprite = window.CTDLGAME.assets['genesisBlock']
      this.context.globalAlpha = this.opacity
      this.context.drawImage(
        sprite,
        this.spriteData.x, this.spriteData.y, this.w, this.h,
        this.x, this.y, this.w, this.h
      )
    }
    if (this.status === 'bad') {
      this.context.strokeStyle = '#F00'
      this.context.beginPath()
      this.context.moveTo(this.x - .5 , this.y - .5)
      this.context.lineTo(this.x - .5  + this.w, this.y - .5 + this.h)
      this.context.moveTo(this.x - .5  + this.w, this.y - .5)
      this.context.lineTo(this.x - .5 , this.y - .5 + this.h)
      this.context.stroke()
    }

    if (this.selected) {
      constants.menuContext.strokeStyle = '#FFF'
      constants.menuContext.fillStyle = '#212121'

      drawPolygon(constants.menuContext, [
        { x: this.x + Math.round(this.w / 2), y: this.y - 1 },
        { x: 3, y: -3 },
        { x: 30 - Math.round(this.w / 2) / 2, y: 0 },
        { x: 0, y: -13 },
        { x: -64, y: 0 },
        { x: 0, y: 13 },
        { x: 30 - Math.round(this.w / 2) / 2, y: 0 },
        { x: 3, y: 3 }
      ])

      let infoText = this.info.height > 0 ? 'Block: ' + this.info.height : 'Genesisblock'
      write(
        constants.menuContext,
        infoText,
        { x: this.x - 30 + Math.round(this.w / 2), y: this.y - 15, w: 64}
      )
    }
  }
  this.getBoundingBox = () => this

  this.getCenter = () => ({
    x: this.x + this.w / 2 - 1,
    y: this.y + this.h / 2 - 1
  })

  this.select = () => {
    console.log(this.info)
    this.selected = true
    window.SELECTED = this
  }
  this.unselect = () => {
    this.selected = false
    window.SELECTED = null
  }

  this.toJSON = () => ({
    id: this.id,
    class: this.class,
    w: this.w,
    h: this.h,
    x: this.x,
    y: this.y,
    isStatic: this.isStatic,
    isSolid: this.isSolid,
    opacity: this.opacity,
    info: this.info
  })
}