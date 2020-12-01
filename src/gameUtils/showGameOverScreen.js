import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'
import { write } from '../font'
import { canDrawOn } from '../performanceUtils'

/**
 * @description Method to display progress bar
 * @param {Number} progress current progress between 0 - 1
 */
export const showGameOverScreen = () => {
  if (!canDrawOn('overlayContext')) return

    constants.overlayContext.fillStyle = '#212121'
  
    constants.overlayContext.fillRect(
      CTDLGAME.viewport.x,
      CTDLGAME.viewport.y,
      constants.WIDTH,
      constants.HEIGHT
    )
  
    constants.overlayContext.drawImage(
      CTDLGAME.assets.gameOver,
      0, 0, 41, 21,
      CTDLGAME.viewport.x + constants.WIDTH / 2 - 20,
      CTDLGAME.viewport.y + constants.HEIGHT / 3,
      41, 21
    )
  
    let text = CTDLGAME.frame / constants.FRAMERATE > constants.FRAMERATE ? '~ new game' : 'new game'
    write(
      constants.overlayContext,
      text,
      {
        x: CTDLGAME.viewport.x + constants.WIDTH / 2 - 35,
        y: CTDLGAME.viewport.y + constants.HEIGHT / 2,
        w: 60
      },
      'right'
    )
  }
2  