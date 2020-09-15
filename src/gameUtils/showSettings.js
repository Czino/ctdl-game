import constants from '../constants'
import { drawIcon } from '../icons'

export const showSettings = () => {
  const musicButton = constants.BUTTONS.find(button => button.action === 'music')
  const soundButton = constants.BUTTONS.find(button => button.action === 'sound')
  const posMusic = {
    x: musicButton.x + window.CTDLGAME.viewport.x,
    y: musicButton.y + window.CTDLGAME.viewport.y
  }
  const posSound = {
    x: soundButton.x + window.CTDLGAME.viewport.x,
    y: soundButton.y + window.CTDLGAME.viewport.y
  }

  constants.menuContext.strokeStyle = '#FFF'
  constants.menuContext.fillStyle = '#FFF'
  constants.menuContext.lineWidth = 1

  constants.menuContext.beginPath()

  drawIcon(constants.menuContext, 'music', {
    x: posMusic.x,
    y: posMusic.y,
    opacity: window.CTDLGAME.options.music ? 1 : .5
  })
  drawIcon(constants.menuContext, 'sound', {
    x: posSound.x,
    y: posSound.y,
    opacity: window.CTDLGAME.options.sound ? 1 : .5
  })
}