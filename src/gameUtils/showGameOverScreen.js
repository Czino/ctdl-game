import constants from '../constants'
import { write } from '../font'

/**
 * @description Method to display progress bar
 * @param {Number} progress current progress between 0 - 1
 */
export const showGameOverScreen = () => {
    constants.overlayContext.fillStyle = '#212121'
  
    constants.overlayContext.fillRect(
      window.CTDLGAME.viewport.x,
      window.CTDLGAME.viewport.y,
      constants.WIDTH,
      constants.HEIGHT
    )
  
    constants.overlayContext.drawImage(
      window.CTDLGAME.assets.gameOver,
      0, 0, 41, 21,
      window.CTDLGAME.viewport.x + constants.WIDTH / 2 - 20,
      window.CTDLGAME.viewport.y + constants.HEIGHT / 3,
      41, 21
    )
  
    let text = window.CTDLGAME.frame / constants.FRAMERATE > constants.FRAMERATE ? '~ new game' : 'new game'
    write(
      constants.overlayContext,
      text,
      {
        x: window.CTDLGAME.viewport.x + constants.WIDTH / 2 - 35,
        y: window.CTDLGAME.viewport.y + constants.HEIGHT / 2,
        w: 60
      },
      'right'
    )
  }
2  