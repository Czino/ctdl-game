import * as db from './db'
import Sun from './sun'
import Moon from './moon'
import Tiles from './tiles'
import plainsMap from './maps/plains'
import { initEvents } from './events'
import constants from './constants'
import {
  CTDLGAME,
  loadAsset,
  showStartScreen,
  showGameOverScreen,
  showProgressBar,
  showOverlay,
  updateViewport,
  showMenu,
  saveGame,
  loadGame,
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
import { applyGravity } from './physicsUtils'
import { intersects } from './geometryUtils'

// import { playSound } from './sounds'

// playSound('woosh')
// setInterval(() => playSound('woosh'), 3000)

// TODO make canvas draw clean pixels
// TODO add ambiental objects
// TODO refactor code
// TODO don't apply gravity to objects outside viewport
// TODO find out why music sometimes does not play
// TODO fix receiving blocks doubled
// TODO add exchange
// TODO add shop
// TODO add first end boss (must be related to shitcoining)
// TODO consider Chef Nomi #SushiSwap
// TODO add more enemies and bosses
// TODO add moon ending scene
// TODO add "mempool"
// TODO make KEYS, BUTTONS, SELECTED and SELECTEDCHARACTER private

window.SELECTED = null
window.SELECTEDCHARACTER = null

let time
const sun = new Sun({
  x: CTDLGAME.viewport.x + constants.WIDTH / 2,
  y: CTDLGAME.viewport.y + 10
})
const moon = new Moon({
  x: CTDLGAME.viewport.x + constants.WIDTH / 2,
  y: CTDLGAME.viewport.y + 10
})
const tiles = new Tiles('plains', plainsMap)

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


    cleanUpStage()

    if (CTDLGAME.isNight) {
      spawnEnemies()
    }

    if (CTDLGAME.wizardCountdown === 0) {
      const wizard = new Wizard(
        'wizard',
        {
          x: CTDLGAME.hodlonaut.x - 40,
          y: constants.WORLD.h - constants.GROUNDHEIGHT - constants.MENU.h - 33
        }
      )
      CTDLGAME.objects.push(wizard)
    } else if (CTDLGAME.wizardCountdown) {
      CTDLGAME.wizardCountdown--
    }

    sun.update()
    moon.update()
    tiles.update()

    applyGravity()

    updateViewport()
    showOverlay()

    showMenu(CTDLGAME.inventory)
    writeMenu()

    // Don't add blocks to Quadtree that are not in viewport
    CTDLGAME.quadTree.clear()
    CTDLGAME.objects
      .filter(object => {
        if (object.class === 'Block') {
          return intersects(object, CTDLGAME.viewport)
        }
        return true
      })
      .forEach(object => CTDLGAME.quadTree.insert(object))

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