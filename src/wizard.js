import { write } from './font';
import constants from './constants'
import { addTextToQueue, checkBlocks } from './gameUtils'
import Explosion from './explosion'

export default function(id, context, quadTree, options) {
  this.id = id;
  this.class = 'Wizard'
  this.status = 'cool'
  this.quadTree = quadTree
  this.context = context
  this.w = 43
  this.h = 34
  this.x = options.x
  this.y = options.y
  this.hasAppeared = false
  this.opacity = .5

  let explosion
  this.update = () => {
    const sprite = window.CTDLGAME.assets.wizard

    if (!this.hasAppeared) {
      this.hasAppeared = true
      explosion = new Explosion(this.context, { x: this.getCenter().x, y: this.getCenter().y })

      window.CTDLGAME.hodlonaut.idle()
      window.CTDLGAME.hodlonaut.direction = 'left'
      window.CTDLGAME.katoshi.idle()
      window.CTDLGAME.katoshi.direction = 'left'

      window.CTDLGAME.wizardCountdown = null
      window.CTDLGAME.lockCharacters = true

      addTextToQueue('W: At last, I found you!')
      addTextToQueue('W: I am the wizard of \nmagic internet money.')
      addTextToQueue('W: I have been looking \nfor you. The world as you\nknow it is ending.')
      addTextToQueue('W: You must prepare \nyourself. Here, take this')
      addTextToQueue('You received...\n the Genesis Block', () => {
        checkBlocks(0)
      })
      addTextToQueue([
        'W: Use this to set the first',
        'block of your citadel.',
        'Protect yourself.'
      ].join('\n'))
      addTextToQueue([
        'W: Beware of those full of',
        'doubt and envy who come',
        'at night.'
      ].join('\n'))
      addTextToQueue('W: We call them shitcoiners,\nlol')
      addTextToQueue('W: I must go now, \nI will see you again,\non the moon!', () => {
        window.CTDLGAME.frame = 0
        this.disappear()
      })
    } else {
      if (this.status === 'disappear') {
        this.opacity = Math.min(this.opacity, Math.abs(this.opacity - .5))
        if (explosion.remove) this.remove = true
      }
      this.context.globalAlpha = this.opacity
      this.context.drawImage(
        sprite,
        0, 0, this.w, this.h,
        this.x, this.y, this.w, this.h
      )
      this.context.globalAlpha = 1
      if (this.status !== 'disappear') this.opacity = 1
    }

    if (explosion) {
      explosion.update()
    }
  }

  this.disappear = () => {
    explosion = new Explosion(this.context, { x: this.getCenter().x, y: this.getCenter().y })
    this.status = 'disappear'
    window.CTDLGAME.lockCharacters = false
  }

  this.getBoundingBox = () => ({
    id: this.id,
    x: this.x,
    y: this.y,
    w: this.w,
    h: this.h
  })

  this.getCenter = () => ({
    x: this.x + this.w / 2,
    y: this.y + this.h / 2
  })

  this.select = () => {}

  this.toJSON = () => ({
    id: this.id,
    class: this.class,
    w: this.w,
    h: this.h,
    x: this.x,
    y: this.y
  })
}