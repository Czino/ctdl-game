import explosion from './sprites/explosion'


export default function(context, { x, y }) {
  this.context = context
  this.w = 48
  this.h = 48
  this.x = x
  this.y = y
  this.frame = 0

  this.update = () => {
    if (this.remove) return

    const sprite = window.CTDLGAME.assets.explosion
    let data = explosion[this.frame]

    this.context.drawImage(
      sprite,
      data.x, data.y, this.w, this.h,
      this.x - this.w / 2, this.y - this.h / 2, this.w, this.h
    )

    this.frame++

    if (this.frame === explosion.length) {
      this.remove = true
    }
  }
}