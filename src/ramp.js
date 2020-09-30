import { CTDLGAME } from './gameUtils'
import constants from './constants';

export default function(id, context, options) {
  this.id = id;
  this.class = 'Ramp'
  this.sprite = options.sprite
  this.context = context
  this.w = options.w || 8
  this.h = options.h || 8
  this.x = options.x
  this.y = options.y
  this.spriteData = options.spriteData || { x: 0, y: 0, w: this.w, h: this.h}
  this.isSolid = options.isSolid
  this.status = options.status

  this.toggleSolid = () => {
    this.isSolid = !this.isSolid
  }

  this.update = () => {}

  this.getBoundingBox = () => this

  this.getCenter = () => ({
    x: this.x + this.w / 2 - 1,
    y: this.y + this.h / 2 - 1
  })

  this.getHeightMap = () => {
    if (this.heightMap) return this.heightMap

    constants.helperContext.clearRect(0, 0, 16, 16)
    constants.helperContext.drawImage(
      CTDLGAME.assets[this.sprite],
      this.spriteData.x, this.spriteData.y, this.spriteData.w, this.spriteData.h,
      0, 0, this.spriteData.w, this.spriteData.h
    )
    let imageData = constants.helperContext.getImageData(0, 0, this.spriteData.w, this.spriteData.h)
    // return only the alpha
    this.heightMap = imageData.data
      .filter((val, i) => i % 4 === 0)
      .reduce((rows, val) => { // make array two dimensional
        let foundRow = rows.find(row => {
          if (row.length < this.w) {
            row.push(val)
            return true
          }
        })
        if (!foundRow) {
          rows.push([val])
        }
        return rows
      }, [[]])

    return this.heightMap
  }

  this.select = () => {}

  this.unselect = () => {}
}