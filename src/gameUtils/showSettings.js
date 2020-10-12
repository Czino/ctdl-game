import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'
import { drawIcon } from '../icons'

/**
 * @description Method to render in game settings (music, sound)
 * @returns {void}
 */
export const showSettings = () => {
  const musicButton = constants.BUTTONS.find(button => button.action === 'music')
  const soundButton = constants.BUTTONS.find(button => button.action === 'sound')
  const posMusic = {
    x: musicButton.x + CTDLGAME.viewport.x,
    y: musicButton.y + CTDLGAME.viewport.y
  }
  const posSound = {
    x: soundButton.x + CTDLGAME.viewport.x,
    y: soundButton.y + CTDLGAME.viewport.y
  }

  constants.menuContext.strokeStyle = '#FFF'
  constants.menuContext.fillStyle = '#FFF'
  constants.menuContext.lineWidth = 1

  constants.menuContext.beginPath()

  drawIcon(constants.menuContext, 'music', {
    x: posMusic.x,
    y: posMusic.y,
    opacity: CTDLGAME.options.music ? 1 : .5
  })
  drawIcon(constants.menuContext, 'sound', {
    x: posSound.x,
    y: posSound.y,
    opacity: CTDLGAME.options.sound ? 1 : .5
  })
}