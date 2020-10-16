import * as db from '../db'
import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'
import { initSoundtrack, stopMusic, changeVolume } from '../soundtrack'
import { newGameButton } from '../events'

let deathCounter = 64
/**
 * @description Method to fade into game over screen
 * @returns {void}
 */
export const fadeIntoGameOver = () => {
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
    db.destroy()

    newGameButton.active = true

    stopMusic()
    changeVolume(1)
    initSoundtrack('gameOver')
    CTDLGAME.objects = []
    CTDLGAME.inventory = {
      sats: 0,
      usd: 0,
      blocks: []
    }
    constants.BUTTONS.find(button => button.action === 'newGame').active = true
  }
}