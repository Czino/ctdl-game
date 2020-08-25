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

export default function(id, context, quadTree, { x, y, w, h, isStatic, isSolid, opacity }, info) {
  this.id = id;
  this.class = 'Block'
  this.spriteData = { x: 0, y: 0, w: 6, h: 6 }
  this.quadTree = quadTree
  this.hasLoaded
  this.context = context
  this.w = w || 6
  this.h = h || 6
  this.x = x
  this.y = y
  this.isStatic = isStatic
  this.isSolid = isSolid
  this.opacity = opacity || 1
  this.status = 'idle'
  this.direction = 'right'
  this.frame = 0
  this.info = info

  this.update = () => {
    const sprite = window.CTDLGAME.assets[this.id === 'ground' ? 'ground' : 'block']
    if (this.id === 'ground') {
      this.context.fillStyle = this.context.createPattern(sprite, 'repeat')

      this.context.fillRect(this.x, this.y, this.w, this.h)
    } else {
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
      this.context.fillStyle = '#0F0'
      this.context.fillRect(
        this.x + this.w / 2, this.y - 2, 1, 1
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
}