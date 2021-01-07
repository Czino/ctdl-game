class GameObject {
  constructor(id, options) {
    this.id = id
    this.w = options.w || 6
    this.h = options.h || 6
    this.x = options.x
    this.y = options.y
  }

  update = () => {}

  getBoundingBox = () => ({
    id: this.id,
    x: this.x,
    y: this.y,
    w: this.w,
    h: this.h
  })

  getCenter = () => ({
    x: Math.round(this.x + this.w / 2),
    y: Math.round(this.y + this.h / 2)
  })

  getClass = () => this.constructor.name

  select = () => {
    if (window.DEBUG) console.log(this)
  }
  unselect = () => {}
}

export default GameObject