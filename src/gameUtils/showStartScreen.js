import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'
import { write } from '../font'
import { canDrawOn } from '../performanceUtils'
import { showSettings } from './showSettings'
import { playSound } from '../sounds'
import { initSoundtrack } from '../soundtrack'
import { loadGameButton, multiPlayerButton, newGameButton, singlePlayerButton } from '../events'

let logoOffsetTop = 100
let logoOffsetBottom = 200
let musicStart = 264
const originalFramerate = constants.FRAMERATE

/**
 * @description Method to display progress bar
 * @returns {void}
 */
export const showStartScreen = () => {
  if (logoOffsetBottom > 0) {
    constants.FRAMERATE = 1 // start screen needs fast animation
    constants.FRAMERATES.gameContext = 1
  } else {
    constants.FRAMERATE = originalFramerate
    constants.FRAMERATES.gameContext = originalFramerate
  }

  if (logoOffsetTop > 0) logoOffsetTop -= 4
  if (logoOffsetTop === 4 && CTDLGAME.options.sound) playSound('drop')
  if (logoOffsetBottom > 0) logoOffsetBottom -= 4
  if (logoOffsetBottom === 4 && CTDLGAME.options.sound) playSound('drop')
  if (musicStart > 0) musicStart -= 4
  if (musicStart === 4) initSoundtrack('mariamMatremVirginem')

  constants.gameContext.drawImage(
    CTDLGAME.assets.logo,
    0, 0, 41, 10,
    CTDLGAME.viewport.x + constants.WIDTH / 2 - 20 - logoOffsetTop,
    CTDLGAME.viewport.y + constants.HEIGHT / 3,
    41, 10
  )
  constants.gameContext.drawImage(
    CTDLGAME.assets.logo,
    0, 10, 41, 10,
    CTDLGAME.viewport.x + constants.WIDTH / 2 - 20 + logoOffsetBottom,
    CTDLGAME.viewport.y + constants.HEIGHT / 3 + 10,
    41, 10
  )

  showSettings()

  if (!canDrawOn('menuContext')) return // do net render menu yet
  write(
    constants.menuContext,
    CTDLGAME.frame % (constants.FRAMERATES.menuContext * 2) === 0 ? '~ new game' : 'new game',
    {
      x: CTDLGAME.viewport.x + newGameButton.x - 10,
      y: CTDLGAME.viewport.y + newGameButton.y,
      w: newGameButton.w
    },
    'right'
  )

  if (!CTDLGAME.newGame) {
    write(
      constants.menuContext,
      CTDLGAME.frame % (constants.FRAMERATES.menuContext * 2) === 0 ? '~ resume game' : 'resume game',
      {
        x: CTDLGAME.viewport.x + loadGameButton.x - 10,
        y: CTDLGAME.viewport.y + loadGameButton.y,
        w: loadGameButton.w
      },
      'right'
    )
  }

  if (!CTDLGAME.touchScreen) {
    write(
      constants.menuContext,
      CTDLGAME.multiPlayer ? '1P' : '> 1P',
      {
        x: CTDLGAME.viewport.x + singlePlayerButton.x - 10,
        y: CTDLGAME.viewport.y + singlePlayerButton.y,
        w: singlePlayerButton.w
      },
      'right'
    )
    write(
      constants.menuContext,
      CTDLGAME.multiPlayer ? '> 2P' : '2P',
      {
        x: CTDLGAME.viewport.x + multiPlayerButton.x - 10,
        y: CTDLGAME.viewport.y + multiPlayerButton.y,
        w: multiPlayerButton.w
      },
      'right'
    )

    write(
      constants.menuContext,
      [
        '',
        'move:',
        'jump:',
        'attack:',
        !CTDLGAME.multiPlayer ? 'switch:' : ''
      ].join('\n'), {
        x: CTDLGAME.viewport.x + constants.WIDTH / 2 - 41,
        y: CTDLGAME.viewport.y + constants.HEIGHT / 2 + 60,
        w: 60
      },
      'left'
    )
    write(
      constants.menuContext,
      [
        'P1:',
        'WASD',
        !CTDLGAME.multiPlayer ? 'Q / SPACE' : 'Q',
        !CTDLGAME.multiPlayer ? 'E / ENTER' : 'E',
        !CTDLGAME.multiPlayer ? 'TAB' : ''
      ].join('\n'), {
        x: CTDLGAME.viewport.x + constants.WIDTH / 2,
        y: CTDLGAME.viewport.y + constants.HEIGHT / 2 + 60,
        w: 60
      },
      'left'
    )
    if (CTDLGAME.multiPlayer) {
      write(
        constants.menuContext,
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
}