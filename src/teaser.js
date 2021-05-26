import * as db from './db'
import { initEvents, loadGameButton, newGameButton } from './eventUtils'
import constants from './constants'
import {
  CTDLGAME,
  loadAsset,
  showStartGameScreen,
  showStartScreen,
  showProgressBar,
  clearCanvas,
  saveStateExists,
} from './gameUtils'
import { isSoundLoaded, toggleSounds } from './sounds'
import { toggleSoundtrack } from './soundtrack'
import { showButtons, showFrameRate } from './debugUtils'
import { write } from './font'

init()

/**
 * @description Method to init the game
 * @returns {void}
 */
async function init() {
  let i = 0
  let len = Object.keys(CTDLGAME.assets).length
  for (let key in CTDLGAME.assets) {
    CTDLGAME.assets[key] = await loadAsset(CTDLGAME.assets[key])
    constants.overlayContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)

    showProgressBar(i / (len - 1))
    i++
  }

  await db.init(constants.debug)

  let options = await db.get('options')
  if (options) CTDLGAME.options = options
  toggleSoundtrack(CTDLGAME.options.music)
  toggleSounds(CTDLGAME.options.sound)

  CTDLGAME.isSoundLoaded = isSoundLoaded()

  if (CTDLGAME.isSoundLoaded) {
    constants.BUTTONS
        .filter(button => /initGame/.test(button.action))
        .forEach(button => button.active = false)
    if (!(await saveStateExists())) {
      CTDLGAME.newGame = true
    } else {
      constants.BUTTONS
        .filter(button => /loadGame/.test(button.action))
        .forEach(button => button.active = true)
    }
    initEvents(CTDLGAME.startScreen)
  }

  constants.overlayContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
  constants.BUTTONS.push({
    action: 'followMe',
    x: 0,
    y: constants.HEIGHT / 2,
    w: constants.WIDTH,
    h: 80,
    active: true,
    onclick: async () => {
      window.location.href = 'https://twitter.com/capoczino'
    }
  })
  tick()
}

/**
 * @description Method to to execute game logic for each tick
 * It also takes care of rendering a frame at specified framerate
 */
function tick() {
  CTDLGAME.frame++

  newGameButton.active = false
  loadGameButton.active = false

  if (CTDLGAME.startScreen) {
    clearCanvas()

    showStartScreen()

    constants.menuContext.clearRect(
      CTDLGAME.viewport.x,
      CTDLGAME.viewport.y + constants.HEIGHT / 2,
      constants.WIDTH,
      constants.HEIGHT
    )

    write(
      constants.menuContext,
      [
        'coming soon!',
      ].join('\n'), {
        x: CTDLGAME.viewport.x,
        y: CTDLGAME.viewport.y + constants.HEIGHT / 2,
        w: constants.WIDTH
      },
      'center'
    )


    write(
      constants.menuContext,
      [
        'follow me on twitter'
      ].join('\n'), {
        x: CTDLGAME.viewport.x,
        y: CTDLGAME.viewport.y + constants.HEIGHT / 2 + 20,
        w: constants.WIDTH
      },
      'center'
    )
    write(
      constants.menuContext,
      [
        'to stay up-to-date'
      ].join('\n'), {
        x: CTDLGAME.viewport.x,
        y: CTDLGAME.viewport.y + constants.HEIGHT / 2 + 32,
        w: constants.WIDTH
      },
      'center'
    )
    write(
      constants.menuContext,
      [
        '@capoczino'
      ].join('\n'), {
        x: CTDLGAME.viewport.x,
        y: CTDLGAME.viewport.y + constants.HEIGHT / 2 + 44,
        w: constants.WIDTH
      },
      'center'
    )

    return window.requestAnimationFrame(tick)
  } else if (CTDLGAME.frame % constants.FRAMERATE !== 0) {
    // throttle framerate
    return window.requestAnimationFrame(tick)
  }

  if (!CTDLGAME.isSoundLoaded) {
    showStartGameScreen()

    if (window.SHOWBUTTONS) showButtons()

    showFrameRate()
    return window.requestAnimationFrame(tick)
  }
  
  return window.requestAnimationFrame(tick)
}