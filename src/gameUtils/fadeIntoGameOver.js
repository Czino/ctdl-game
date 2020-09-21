// import * as db from '../db'
import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'

import { initSoundtrack, startMusic, stopMusic, changeVolume } from '../soundtrack'
import { initEvents } from '../events'

let deathCounter = 64
/**
 * @description Method to fade into game over screen
 */
export const fadeIntoGameOver = () => {
  if (deathCounter === 64) {
    initEvents(true)
  }
  deathCounter--

  changeVolume(deathCounter / 64)

  constants.overlayContext.fillStyle = '#212121'
  constants.overlayContext.globalAlpha = (64 - deathCounter) / 64
  constants.overlayContext.fillRect(
    CTDLGAME.viewport.x,
    CTDLGAME.viewport.y,
    constants.WIDTH,
    constants.HEIGHT
  )
  if (deathCounter === 0) {
    CTDLGAME.gameOver = true
    // db.destroy()

    stopMusic()
    changeVolume(1)
    initSoundtrack('gameOver')
    startMusic()
    constants.BUTTONS.find(button => button.action === 'newGame').active = true
  }
}