import constants from '../constants'
import { CTDLGAME, checkBlocks } from '../gameUtils'
import { addTextToQueue } from '../textUtils'
import { playSound } from '../sounds'
import Explosion from '../Explosion'

export default function(id, options) {
  this.id = id;
  this.class = 'Wizard'
  this.status = 'cool'
  this.w = 43
  this.h = 34
  this.x = options.x
  this.y = options.y
  this.hasAppeared = false
  this.opacity = .5

  let explosion
  this.update = () => {
    const sprite = CTDLGAME.assets.wizard

    if (!this.hasAppeared) {
      playSound('magic')
      this.hasAppeared = true
      explosion = new Explosion(constants.charContext, { x: this.getCenter().x, y: this.getCenter().y })

      CTDLGAME.hodlonaut.idle()
      CTDLGAME.hodlonaut.direction = 'left'
      CTDLGAME.katoshi.idle()
      CTDLGAME.katoshi.direction = 'left'

      CTDLGAME.wizardCountdown = null
      CTDLGAME.lockCharacters = true
      constants.BUTTONS.find(btn => btn.action === 'skipCutScene').active = true

      addTextToQueue('Wizard:\n At last, I found you!')
      addTextToQueue('Wizard:\n I am the wizard of \nmagic internet money.')
      addTextToQueue('Wizard:\n I have been looking \nfor you. The world as you\nknow it is ending.')
      addTextToQueue('Wizard:\n You must prepare \nyourself. Here, take this')
      addTextToQueue('You received...\n the Genesis Block', () => {
        checkBlocks(0)
      })
      if (CTDLGAME.touchScreen) {
        addTextToQueue('Tap and hold the screen\nto set blocks near you.')
      } else {
        addTextToQueue('Use the mouse\nto set blocks near you.')
      }
      addTextToQueue([
        'Wizard:\n Use this to set the first',
        'block of your citadel.',
        'Protect yourself.'
      ].join('\n'))
      addTextToQueue([
        'Wizard:\n Beware of those full of',
        'doubt and envy who come',
        'at night.'
      ].join('\n'))
      addTextToQueue('Wizard:\n We call them shitcoiners,\nlol')
      addTextToQueue('Wizard:\n I must go now, \nI will see you again,\non the moon!', () => {
        this.disappear()
      })
    } else {
      if (this.status === 'disappear') {
        this.opacity = Math.min(this.opacity, Math.abs(this.opacity - .5))
        if (explosion.remove) this.remove = true
      }
      constants.charContext.globalAlpha = this.opacity
      constants.charContext.drawImage(
        sprite,
        0, 0, this.w, this.h,
        this.x, this.y, this.w, this.h
      )
      constants.charContext.globalAlpha = 1
      if (this.status !== 'disappear') this.opacity = 1
    }

    if (explosion) {
      explosion.update()
    }
  }

  this.disappear = () => {
    playSound('magic')
    explosion = new Explosion(constants.charContext, { x: this.getCenter().x, y: this.getCenter().y })
    this.status = 'disappear'
    CTDLGAME.lockCharacters = false
    constants.BUTTONS.find(btn => btn.action === 'skipCutScene').active = false
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