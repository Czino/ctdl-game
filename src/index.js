import * as db from './db'
import Sun from './sun'
import Moon from './moon'
import { initEvents } from './events'
import constants from './constants'
import {
  CTDLGAME,
  loadAsset,
  showStartGameScreen,
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
  cleanUpStage,
  showShop, showSettings
} from './gameUtils'
import { writeMenu } from './textUtils'
import Wizard from './npcs/Wizard'
import { applyGravity } from './physicsUtils'
import { intersects } from './geometryUtils'
import { isSoundLoaded, toggleSounds } from './sounds'
import { toggleSoundtrack } from './soundtrack'
import { changeMap } from './mapUtils'
import Item from './Item'

// import { playSound } from './sounds'
// playSound('honeyBadger')
// setInterval(() => playSound('honeyBadger'), 3000)

// TODO add option to buy Schiff's gold
// TODO add forest enemies
// TODO add exchange
// TODO no twilight
// TODO add rabbit hole stage (many white bunnies, some turn to demons and atec)
// TODO add a way to revive rekt characters
// TODO load assets only when needed
// TODO dynamically load songs when needed
// TODO make canvas draw clean pixels
// TODO refactor code
// TODO fix receiving blocks doubled
// TODO consider Chef Nomi #SushiSwap
// TODO add more enemies and bosses
// TODO add moon ending scene
// TODO add "mempool"

window.SELECTED = null
window.SELECTEDCHARACTER = null

let time

// TODO sun and moon seem lost here
const sun = new Sun({
  x: CTDLGAME.viewport.x + constants.WIDTH / 2,
  y: CTDLGAME.viewport.y + 10
})
const moon = new Moon({
  x: CTDLGAME.viewport.x + constants.WIDTH / 2,
  y: CTDLGAME.viewport.y + 10
})

init()

/**
 * @description Method to init the game
 * @returns {void}
 */
async function init() {
  let i = 0

  for (let key in CTDLGAME.assets) {
    CTDLGAME.assets[key] = await loadAsset(CTDLGAME.assets[key])
    constants.overlayContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)

    showProgressBar(i / (Object.keys(CTDLGAME.assets).length - 1))
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

  tick()
}

/**
 * @description Method to to execute game logic for each tick
 * It also takes care of rendering a frame at specified framerate
 */
function tick() {
  if (!CTDLGAME.isSoundLoaded) {
    if (CTDLGAME.frame / constants.FRAMERATE % 16 === 0) CTDLGAME.frame = 0
    showStartGameScreen()
    CTDLGAME.frame++
    return window.requestAnimationFrame(tick)
  }
  if (CTDLGAME.startScreen) {
    if (CTDLGAME.frame / constants.FRAMERATE % 16 === 0) CTDLGAME.frame = 0
    clearCanvas()

    showStartScreen()
    CTDLGAME.frame++
    return window.requestAnimationFrame(tick)
  }
  if (CTDLGAME.cutScene) {
    clearCanvas()

    writeMenu()
    showSettings()
    CTDLGAME.frame++
    return window.requestAnimationFrame(tick)
  }
  if (!CTDLGAME.hodlonaut) {
    return window.requestAnimationFrame(tick)
  }

  if (CTDLGAME.gameOver) {
    if (CTDLGAME.frame / constants.FRAMERATE % 16 === 0) CTDLGAME.frame = 0
    showGameOverScreen()
    CTDLGAME.frame++
    return window.requestAnimationFrame(tick)
  }


  if ((CTDLGAME.frame * 1.5) % constants.FRAMERATE === 0) {
    // TODO sometimes it happens that the background does not change
    circadianRhythm(time)
  }
  if (CTDLGAME.frame % constants.FRAMERATE === 0) {
    time = getTimeOfDay()
    if (CTDLGAME.frame !== 0 && CTDLGAME.frame % constants.CHECKBLOCKTIME === 0) checkBlocks()

    if (CTDLGAME.showShop) {
      showShop()
      showMenu(CTDLGAME.inventory)
      writeMenu()
      CTDLGAME.frame++
      return window.requestAnimationFrame(tick)
    }

    clearCanvas()

    if (CTDLGAME.world) cleanUpStage()

    spawnEnemies()

    if (CTDLGAME.wizardCountdown === 0) {
      CTDLGAME.objects.push(new Wizard(
        'wizard',
        {
          x: window.SELECTEDCHARACTER.x - 40,
          y: CTDLGAME.world.h - constants.GROUNDHEIGHT - constants.MENU.h - 33
        }
      ))
    } else if (CTDLGAME.wizardCountdown) {
      CTDLGAME.wizardCountdown--
    }

    sun.update()
    moon.update()
    CTDLGAME.world.update()

    applyGravity()

    // update objects that shall update and are in viewport
    CTDLGAME.objects
      .filter(object => object.update)
      .filter(obj => obj.inViewport)
      .forEach(object => object.update())

    updateViewport()

    if (CTDLGAME.showOverlay) showOverlay()

    showMenu(CTDLGAME.inventory)
    writeMenu()

    // Don't add blocks to Quadtree that are not in viewport
    CTDLGAME.quadTree.clear()
    CTDLGAME.objects
      .filter(object => {
        if (object.class === 'Block' || object.class === 'Ramp') {
          return intersects(object, CTDLGAME.viewport)
        }
        return true
      })
      .forEach(object => CTDLGAME.quadTree.insert(object))

    if (window.SHOWQUAD) CTDLGAME.quadTree.show(constants.overlayContext)

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
  return window.requestAnimationFrame(tick)
}

// Developer cheat codes
window.heal = () => {
  CTDLGAME.hodlonaut.heal(5)
  CTDLGAME.katoshi.heal(5)
}
window.revive = () => {
  CTDLGAME.hodlonaut.heal(5)
  CTDLGAME.katoshi.heal(5)
  if (CTDLGAME.hodlonaut.status === 'rekt') {
    CTDLGAME.hodlonaut.y -= 21
    CTDLGAME.hodlonaut.status = 'idle'
  }
  if (CTDLGAME.katoshi.status === 'rekt') {
    CTDLGAME.katoshi.y -= 21
    CTDLGAME.katoshi.status = 'idle'
  }
}
window.save = () => {
  saveGame()
}

window.dropItem = id => {
  CTDLGAME.objects.push(new Item(
    id,
    window.SELECTEDCHARACTER.toJSON()
  ))
}
window.killEnemies = () => CTDLGAME.objects
  .filter(obj => obj.enemy)
  .map(obj => obj.die())

window.changeMap = changeMap
window.CTDLGAME = CTDLGAME