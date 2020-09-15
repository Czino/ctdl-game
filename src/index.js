import * as db from './db'
import { QuadTree, Boundary } from './quadTree'
import Sun from './sun'
import Moon from './moon'
import { initEvents } from './events'
import constants from './constants'
import {
  assets,
  loadAsset,
  showStartScreen,
  showGameOverScreen,
  showProgressBar,
  showOverlay,
  updateViewport,
  showMenu,
  saveGame,
  checkBlocks,
  getTimeOfDay,
  showSaveIcon,
  clearCanvas,
  saveStateExists,
  fadeIntoGameOver,
  circadianRhythm,
  spawnEnemies,
  cleanUpStage
} from './gameUtils'
import { writeMenu } from './textUtils'
import Wizard from './wizard'
import { applyGravity } from './physicUtils'

// import { playSound } from './sounds'

// playSound('block')
// setInterval(() => playSound('block'), 3000)

// TODO fix receiving blocks doubled
// TODO add exchange
// TODO add shop
// TODO find out why music sometimes does not play
// TODO refactor code
// don't make CTDL global

window.SELECTED = null
window.SELECTEDCHARACTER = null

window.CTDLGAME = {
  cursor: {x: 0, y: 0},
  frame: 0,
  assets,
  startScreen: true,
  touchScreen: true,
  options: {
    music: true,
    sound: true
  },
  viewport: constants.START,
  objects: [],
  blockHeight: -1,
  inventory: {
    usd: 0,
    sats: 0,
    blocks: []
  },
  quadTree: new QuadTree(new Boundary({
    x: 0,
    y: 0,
    ...constants.WORLD
  }))
}

let time
const sun = new Sun(constants.gameContext, {
  x: CTDLGAME.viewport.x + constants.WIDTH / 2,
  y: CTDLGAME.viewport.y + 10
})
const moon = new Moon(constants.gameContext, {
  x: CTDLGAME.viewport.x + constants.WIDTH / 2,
  y: CTDLGAME.viewport.y + 10
})

init()

async function init() {
  let i = 0
  for (let key in CTDLGAME.assets) {
    CTDLGAME.assets[key] = await loadAsset(CTDLGAME.assets[key])
    constants.overlayContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)

    showProgressBar(i / (Object.keys(CTDLGAME.assets).length - 1))
    i++
  }

  await db.init(constants.debug)

  if (!(await saveStateExists())) {
    CTDLGAME.newGame = true
  } else {
    constants.BUTTONS
      .filter(button => /loadGame/.test(button.action))
      .forEach(button => button.active = true)
  }

  initEvents(CTDLGAME.startScreen)

  constants.overlayContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)

  tick()
}

function tick() {
  if (CTDLGAME.startScreen) {
    if (CTDLGAME.frame / constants.FRAMERATE % 16 === 0) CTDLGAME.frame = 0
    showStartScreen()
    CTDLGAME.frame++
    window.requestAnimationFrame(tick)
    return
  }
  if (!CTDLGAME.hodlonaut) {
    window.requestAnimationFrame(tick)
    return
  }

  if (CTDLGAME.gameOver) {
    if (CTDLGAME.frame / constants.FRAMERATE % 16 === 0) CTDLGAME.frame = 0
    showGameOverScreen()
    CTDLGAME.frame++
    window.requestAnimationFrame(tick)
    return
  }


  if ((CTDLGAME.frame * 1.5) % constants.FRAMERATE === 0) {
    circadianRhythm(time)
  }
  if (CTDLGAME.frame % constants.FRAMERATE === 0) {
    time = getTimeOfDay()
    if (CTDLGAME.frame !== 0 && CTDLGAME.frame % constants.CHECKBLOCKTIME === 0) {
      checkBlocks()
    }

    clearCanvas()

    CTDLGAME.objects = CTDLGAME.objects.filter(obj => obj && !obj.remove && obj.y < 2048)

    if (CTDLGAME.isNight) {
      spawnEnemies()
    } else {
      cleanUpStage()
    }

    if (window.CTDLGAME.wizardCountdown === 0) {
      const wizard = new Wizard(
        'wizard',
        constants.charContext,
        window.CTDLGAME.quadTree,
        {
          x: window.CTDLGAME.hodlonaut.x - 40,
          y: constants.WORLD.h - constants.GROUNDHEIGHT - constants.MENU.h - 33
        }
      )
      window.CTDLGAME.objects.push(wizard)
    } else if (window.CTDLGAME.wizardCountdown) {
      window.CTDLGAME.wizardCountdown--
    }

    sun.update()
    moon.update()

    applyGravity()

    updateViewport()
    showOverlay()

    showMenu(CTDLGAME.inventory)
    writeMenu()

    CTDLGAME.quadTree.clear()
    CTDLGAME.objects.forEach(object => CTDLGAME.quadTree.insert(object))

    if (window.SHOWQUAD) CTDLGAME.quadTree.show(constants.gameContext)

    if (CTDLGAME.frame !== 0 && CTDLGAME.frame % constants.SAVERATE === 0) {
      saveGame()
    }
    // fade out save icon
    if (CTDLGAME.frame > 256 && CTDLGAME.frame % constants.SAVERATE < 256) {
      showSaveIcon((256 - CTDLGAME.frame % constants.SAVERATE) / 256)
    }

    if (CTDLGAME.frame > constants.FRAMERESET) {
      CTDLGAME.frame = 0
    }

    if (!CTDLGAME.hodlonaut.health && !CTDLGAME.katoshi.health) {
      fadeIntoGameOver()
    }
  }

  CTDLGAME.frame++
  window.requestAnimationFrame(tick)
}