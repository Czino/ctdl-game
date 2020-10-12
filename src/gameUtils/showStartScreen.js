import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'
import { write } from '../font'
import { showSettings } from './showSettings'
import { playSound } from '../sounds'
import { initSoundtrack } from '../soundtrack'

let logoOffsetTop = 100
let logoOffsetBottom = 200

/**
 * @description Method to display progress bar
 * @returns {void}
 */
export const showStartScreen = () => {
  constants.overlayContext.fillStyle = '#212121'

  constants.overlayContext.fillRect(
    CTDLGAME.viewport.x,
    CTDLGAME.viewport.y,
    constants.WIDTH,
    constants.HEIGHT
  )

  if (logoOffsetTop > 0) logoOffsetTop -= 4
  if (logoOffsetTop === 4) {
    if (CTDLGAME.options.sound) playSound('drop')
  }
  if (logoOffsetBottom > 0) logoOffsetBottom -= 4
  if (logoOffsetBottom === 4) {
    if (CTDLGAME.options.sound) playSound('drop')
    setTimeout(() => initSoundtrack('mariamMatremVirginem'), 1000)
    // setTimeout(() => constants.BUTTONS.find(btn => btn.action === 'loadGame').onclick(), 100)
  }
  constants.overlayContext.drawImage(
    CTDLGAME.assets.logo,
    0, 0, 41, 10,
    CTDLGAME.viewport.x + constants.WIDTH / 2 - 20 - logoOffsetTop,
    CTDLGAME.viewport.y + constants.HEIGHT / 3,
    41, 10
  )
  constants.overlayContext.drawImage(
    CTDLGAME.assets.logo,
    0, 10, 41, 10,
    CTDLGAME.viewport.x + constants.WIDTH / 2 - 20 + logoOffsetBottom,
    CTDLGAME.viewport.y + constants.HEIGHT / 3 + 10,
    41, 10
  )

  showSettings()

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
        'attack:',
        '',
        'switch: TAB'
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