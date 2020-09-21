export default function(id, options) {
  this.id = id
  this.w = options.w || 6
  this.h = options.h || 6
  this.x = options.x
  this.y = options.y

  this.update = () => {}
  this.getBoundingBox = () => this

  this.getCenter = () => ({
    x: this.x + this.w / 2 - 1,
    y: this.y + this.h / 2 - 1
  })

  this.select = () => {}
  this.unselect = () => {}
}