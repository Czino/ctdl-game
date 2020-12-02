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
  constants.menuContext.fillStyle = '#212121'

  constants.menuContext.fillRect(
    CTDLGAME.viewport.x,
    CTDLGAME.viewport.y,
    constants.WIDTH,
    constants.HEIGHT
  )
  constants.menuContext.fillStyle = '#FFF'
  constants.menuContext.strokeStyle = '#FFF'
  constants.menuContext.lineWidth = 1

  constants.menuContext.beginPath()
  constants.menuContext.rect(
    progressBar.x + CTDLGAME.viewport.x - .5,
    progressBar.y + CTDLGAME.viewport.y - .5,
    progressBar.w,
    progressBar.h
  )
  constants.menuContext.stroke()

  constants.menuContext.fillRect(
    progressBar.x + CTDLGAME.viewport.x,
    progressBar.y + CTDLGAME.viewport.y,
    progressBar.w * progress - 1,
    progressBar.h - 1
  )

  write(
    constants.menuContext,
    Math.round(progress * 100) + '%', {
      x: progressBar.x + CTDLGAME.viewport.x,
      y: progressBar.y + CTDLGAME.viewport.y + progressBar.h + 1,
      w: progressBar.w
    }
  )
}