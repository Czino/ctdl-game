import constants from '../constants'
import { write } from '../font'
import { CTDLGAME } from './CTDLGAME'

const progressBar = {
  x: 20,
  y: constants.HEIGHT / 2 - 20,
  w: constants.WIDTH - 40,
  h: 20
}

/**
 * @description Method to display progress bar
 * @param {Number} progress current progress between 0 - 1
 */
export const showProgressBar = progress => {
  constants.overlayContext.fillStyle = '#212121'

  constants.overlayContext.fillRect(
    CTDLGAME.viewport.x,
    CTDLGAME.viewport.y,
    constants.WIDTH,
    constants.HEIGHT
  )
  constants.overlayContext.fillStyle = '#FFF'
  constants.overlayContext.strokeStyle = '#FFF'
  constants.overlayContext.lineWidth = 1

  constants.overlayContext.beginPath()
  constants.overlayContext.rect(
    progressBar.x + CTDLGAME.viewport.x - .5,
    progressBar.y + CTDLGAME.viewport.y - .5,
    progressBar.w,
    progressBar.h
  )
  constants.overlayContext.stroke()

  constants.overlayContext.fillRect(
    progressBar.x + CTDLGAME.viewport.x,
    progressBar.y + CTDLGAME.viewport.y,
    progressBar.w * progress - 1,
    progressBar.h - 1
  )

  write(
    constants.overlayContext,
    Math.round(progress * 100) + '%', {
      x: progressBar.x + CTDLGAME.viewport.x,
      y: progressBar.y + CTDLGAME.viewport.y + progressBar.h + 1,
      w: progressBar.w
    }
  )
}