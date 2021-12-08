import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'
import { write } from '../font'
import { canDrawOn } from '../performanceUtils'
import { showSettings } from './showSettings'
import { loadGameButton, multiPlayerButton, newGameButton, singlePlayerButton } from '../eventUtils'

const velocity = 4
let logoOffsetTop = -100
let logoOffsetBottom = 180
let musicStart = 180

const $body = document.getElementById('body')
const shock = (x = 0, y = 1) => {
  $body.style.left = x + 'vh'
  $body.style.top = y + 'vh'
  setTimeout(() => {
    $body.style.left = '0'
    $body.style.top = '0'
  })
}

/**
 * @description Method to display progress bar
 * @returns {void}
 */
export const showStartScreen = () => {
  if (logoOffsetTop < 0) logoOffsetTop += velocity
  if (logoOffsetTop === -velocity) {
    shock(1, .5)
  }
   if (logoOffsetTop === -velocity && CTDLGAME.options.sound) {
    window.SOUND.playSound('drop')
  }
  if (logoOffsetBottom > 0) logoOffsetBottom -= velocity
  if (logoOffsetBottom === velocity) {
    shock(-1, .5)
  }
  if (logoOffsetBottom === velocity && CTDLGAME.options.sound) {
    window.SOUND.playSound('drop')
  }
  if (musicStart > 0) musicStart -= velocity
  if (musicStart === velocity) window.SNDTRCK.initSoundtrack('theyCameFromAbove')

  constants.gameContext.clearRect(
    CTDLGAME.viewport.x,
    CTDLGAME.viewport.y + constants.HEIGHT / 3,
    constants.WIDTH,
    51
  )
  constants.gameContext.drawImage(
    CTDLGAME.assets.logo,
    0, 0, 41, 10,
    CTDLGAME.viewport.x + constants.WIDTH / 2 - 20 + logoOffsetTop,
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
  if (CTDLGAME.menuItem > 1) CTDLGAME.menuItem = 0
  if (CTDLGAME.menuItem < 0) CTDLGAME.menuItem = 1

  if (newGameButton.active) {
    write(
      constants.menuContext,
        CTDLGAME.menuItem === 0
        ? CTDLGAME.frame % (constants.FRAMERATES.menuContext * 8) > constants.FRAMERATES.menuContext * 4
          ? '~ new game'
          :'new game'
        : 'new game',
      {
        x: CTDLGAME.viewport.x + newGameButton.x - 10,
        y: CTDLGAME.viewport.y + newGameButton.y,
        w: newGameButton.w
      },
      'right'
    )
  }

  if (!CTDLGAME.newGame && loadGameButton.active) {
    write(
      constants.menuContext,
      CTDLGAME.menuItem === 1
      ? CTDLGAME.frame % (constants.FRAMERATES.menuContext * 8) > constants.FRAMERATES.menuContext * 4
          ? '~ resume game'
          :'resume game'
        : 'resume game',
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