import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'
import { write } from '../font'

/**
 * @description Method to display progress bar
 * @returns {void}
 */
export const showStartGameScreen = () => {
  constants.overlayContext.fillStyle = '#212121'

  constants.overlayContext.fillRect(
    CTDLGAME.viewport.x,
    CTDLGAME.viewport.y,
    constants.WIDTH,
    constants.HEIGHT
  )

  let text = CTDLGAME.frame / constants.FRAMERATE > constants.FRAMERATE ? '$ bitcoind -daemon' : '$ bitcoind -daemon|'
  write(
    constants.overlayContext,
    text, {
      x: CTDLGAME.viewport.x + constants.WIDTH / 2 - 40,
      y: CTDLGAME.viewport.y + constants.HEIGHT / 2,
      w: constants.WIDTH - 40
    },
    'left'
  )
  write(
    constants.overlayContext,
    'click to start', {
      x: CTDLGAME.viewport.x + constants.WIDTH / 2 - 29,
      y: CTDLGAME.viewport.y + constants.HEIGHT / 2 + 20,
      w: constants.WIDTH - 40
    },
    'left'
  )
}