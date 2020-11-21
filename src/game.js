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
import { addTextToQueue, prompt, writeMenu } from './textUtils'
import Wizard from './npcs/Wizard'
import { applyGravity } from './physicsUtils'
import { isSoundLoaded, toggleSounds } from './sounds'
import { toggleSoundtrack } from './soundtrack'
import { changeMap } from './mapUtils'
import { showButtons } from './debugUtils'
import Item from './Item'

// import { playSound } from './sounds'
// playSound('elevatorStop')
// setInterval(() => playSound('elevatorStop'), 1000)

// TODO accomodate forest and city for new update viewport
// TODO improve stair walking (press up key)
// TODO add forest enemies
// TODO add enemy that forks into two and you have to fight them before they fork again
// TODO game freezes when climbing on trees?
// TODO character on map multiple times
// TODO make the monk's riddle easier?
// TODO add Mt. Gox stage
// TODO add endbosses for Rabbit Hole stage
// TODO add endboss for Doge Mine stage
// TODO add moon stage
// TODO add a citadel stage
// TODO add "mempool" stage
// TODO when one char dies make the other cry?
// TODO when loading game and and another isntance oof game is already opened in another tab, it stalls at 100%
// TODO add game tutorial of some sorts
// TODO katoshi rekt, set block > freeze
// TODO rekt characters should stay in the map they got rekt
// TODO add inventory UI
// TODO add option to buy Schiff's gold
// TODO add exchange
// TODO add rabbit hole stage (many white bunnies, some turn to demons and atec)
// TODO add a way to revive rekt characters
// TODO load assets only when needed
// TODO dynamically load songs when needed
// TODO refactor code
// TODO fix receiving blocks doubled
// TODO consider Chef Nomi #SushiSwap
// TODO add more enemies and bosses
// TODO add moon ending scene
// TODO add Zeus
// TODO add Thor

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

    if (window.SHOWBUTTONS) showButtons()

    CTDLGAME.frame++
    return window.requestAnimationFrame(tick)
  }
  if (CTDLGAME.startScreen) {
    if (CTDLGAME.frame / constants.FRAMERATE % 16 === 0) CTDLGAME.frame = 0
    clearCanvas()
    if (window.SHOWBUTTONS) showButtons()

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

    if (window.SHOWBUTTONS) showButtons()

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

      if (window.SHOWBUTTONS) showButtons()

      CTDLGAME.frame++
      return window.requestAnimationFrame(tick)
    }

    if (CTDLGAME.prompt) {
      prompt(CTDLGAME.prompt)

      if (window.SHOWBUTTONS) showButtons()

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

    if (CTDLGAME.world.map.overworld) {
      sun.update()
      moon.update()
    } else if (CTDLGAME.world.map.bgColor) {
      constants.skyContext.globalAlpha = 1
      constants.skyContext.fillStyle = CTDLGAME.world.map.bgColor()
      constants.skyContext.fillRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
    }

    CTDLGAME.world.update()

    applyGravity()

    // update objects that shall update and are in viewport
    CTDLGAME.objects
      .filter(obj => obj.update && obj.inViewport)
      .forEach(obj => obj.update())

    if (CTDLGAME.world.map.update) CTDLGAME.world.map.update()

    updateViewport()


    if (CTDLGAME.showOverlay) showOverlay()

    showMenu(CTDLGAME.inventory)
    writeMenu()

    // Don't add blocks to Quadtree that are not in viewport
    CTDLGAME.quadTree.clear()
    CTDLGAME.objects
      .filter(obj => obj.inViewport)
      .forEach(object => CTDLGAME.quadTree.insert(object))

    // TODO abstract into all in one debug function
    if (window.SHOWBUTTONS) showButtons()
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
window.constants = constants
window.addTextToQueue = addTextToQueue
window.getTimeOfDay = getTimeOfDay