import constants from '../constants'
import { CTDLGAME, checkBlocks } from '../gameUtils'
import { addTextToQueue } from '../textUtils'
import { playSound } from '../sounds'
import Explosion from '../Explosion'
import Agent from '../Agent'
import { skipCutSceneButton } from '../events'

class Wizard extends Agent {
  constructor(id, options) {
    super(id, options)
    this.hasAppeared = false
    this.opacity = .5
    this.explosion = null
    this.craigRekt = options.craigRekt
  }

  status = 'cool'
  applyGravity = false
  w = 43
  h = 34

  update = () => {
    const sprite = CTDLGAME.assets.wizard

    if (!this.hasAppeared) {
      playSound('magic')
      this.hasAppeared = true
      this.explosion = new Explosion(constants.charContext, { x: this.getCenter().x, y: this.getCenter().y })

      CTDLGAME.hodlonaut.idle.effect()
      CTDLGAME.hodlonaut.direction = 'left'
      CTDLGAME.katoshi.idle.effect()
      CTDLGAME.katoshi.direction = 'left'

      CTDLGAME.wizardCountdown = null
      CTDLGAME.lockCharacters = true
      skipCutSceneButton.active = true

      if (this.craigRekt) {
        addTextToQueue('Wizard:\nAmazing, hodlonaut!')
        addTextToQueue('Wizard:\nYou made it!\nFaketoshi finally got rekt.')
        addTextToQueue('Wizard:\nBy Merlin\'s beard, I hated\nthis guy so much!')
        addTextToQueue('Wizard:\nFinally, we don\'t have to\nendure his bullshit.')
        addTextToQueue('Wizard:\nI would give you special item now, but the game\nis not yet finished.')
        addTextToQueue('Wizard:\nI must go now, \nI will see you again,\non the moon!', () => {
          this.disappear()
        })
      } else {
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
      }
    } else {
      if (this.status === 'disappear') {
        this.opacity = Math.min(this.opacity, Math.abs(this.opacity - .5))
        if (this.explosion.remove) this.remove = true
      }

      // TODO check if the draw method works here
      constants.charContext.globalAlpha = this.opacity
      constants.charContext.drawImage(
        sprite,
        0, 0, this.w, this.h,
        this.x, this.y, this.w, this.h
      )
      constants.charContext.globalAlpha = 1
      if (this.status !== 'disappear') this.opacity = 1
    }

    if (this.explosion) {
      this.explosion.update()
    }
  }

  disappear = () => {
    playSound('magic')
    this.explosion = new Explosion(constants.charContext, { x: this.getCenter().x, y: this.getCenter().y })
    this.status = 'disappear'
    CTDLGAME.lockCharacters = false
    skipCutSceneButton.active = false
  }
}
export default Wizard