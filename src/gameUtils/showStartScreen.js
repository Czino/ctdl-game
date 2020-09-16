import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'
import { write } from '../font'

/**
 * @description Method to display progress bar
 * @param {Number} progress current progress between 0 - 1
 */
export const showStartScreen = () => {
  constants.overlayContext.fillStyle = '#212121'

  constants.overlayContext.fillRect(
    CTDLGAME.viewport.x,
    CTDLGAME.viewport.y,
    constants.WIDTH,
    constants.HEIGHT
  )

  constants.overlayContext.drawImage(
    CTDLGAME.assets.logo,
    0, 0, 41, 21,
    CTDLGAME.viewport.x + constants.WIDTH / 2 - 20,
    CTDLGAME.viewport.y + constants.HEIGHT / 3,
    41, 21
  )

  let text = CTDLGAME.frame / constants.FRAMERATE > constants.FRAMERATE ? '~ new game' : 'new game'
  write(
    constants.overlayContext,
    text, {
      x: CTDLGAME.viewport.x + constants.WIDTH / 2 - 35,
      y: CTDLGAME.viewport.y + constants.HEIGHT / 2,
      w: 60
    },
    'right'
  )

  if (!CTDLGAME.newGame) {
    text = CTDLGAME.frame / constants.FRAMERATE > constants.FRAMERATE ? '~ resume game' : 'resume game'
    write(
      constants.overlayContext,
      text, {
        x: CTDLGAME.viewport.x + constants.WIDTH / 2 - 41,
        y: CTDLGAME.viewport.y + constants.HEIGHT / 2 + 20,
        w: 80
      },
      'right'
    )
  }

  if (!CTDLGAME.touchScreen) {
    write(
      constants.overlayContext,
      [
        '',
        'move:',
        'jump:',
        'attack:'
      ].join('\n'), {
        x: CTDLGAME.viewport.x + constants.WIDTH / 2 - 41,
        y: CTDLGAME.viewport.y + constants.HEIGHT / 2 + 60,
        w: 60
      },
      'left'
    )
    write(
      constants.overlayContext,
      [
        'P1:',
        'WASD',
        'Q',
        'E'
      ].join('\n'), {
        x: CTDLGAME.viewport.x + constants.WIDTH / 2,
        y: CTDLGAME.viewport.y + constants.HEIGHT / 2 + 60,
        w: 60
      },
      'left'
    )
    write(
      constants.overlayContext,
      [
        'P2:',
        'IJKL',
        'O',
        'U'
      ].join('\n'), {
        x: CTDLGAME.viewport.x + constants.WIDTH / 2 + 30,
        y: CTDLGAME.viewport.y + constants.HEIGHT / 2 + 60,
        w: 60
      },
      'left'
    )
  }
}