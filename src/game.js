import * as db from './db'
import Sun from './Sun'
import Moon from './Moon'
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
  showShop, showSettings, executeHooks
} from './gameUtils'
import { addTextToQueue, prompt, writeMenu } from './textUtils'
import Wizard from './npcs/Wizard'
import { applyGravity } from './physicsUtils'
import { isSoundLoaded, toggleSounds } from './sounds'
import { toggleSoundtrack } from './soundtrack'
import { changeMap } from './mapUtils'
import { showButtons, showFrameRate } from './debugUtils'
import Item from './Item'

// import { playSound } from './sounds'
// playSound('policeForceHurt')
// setInterval(() => playSound('policeForceHurt'), 1000)

// TODO add coinbase stage with brian in it instead of just a ruin
// TODO add forest enemies
// TODO add enemy that forks into two and you have to fight them before they fork again
// TODO add Frances Copolla Enemy that subdivides and becomes more
// TODO add endbosses for Rabbit Hole stage
// TODO add endboss for Doge Mine stage
// TODO add moon stage
// TODO add stoners/crackheads to building in city
// TODO add cornfield stage (maybe next to my farm)
// TODO add a magic money tree
// TODO make chairs destoryable
// TODO add cyberhornets
// TODO add shit(coins) you have to jump over
// TODO add phoenix to rabbit hole stage, maybe on top of a tree in the forest, in the doge coin mine etc...
// TODO add a citadel stage
// TODO add link marines (maybe city, create trouble, police attacks both)
// TODO add a beam of light that Marty Bent is talking about
// TODO add egyption like stage with "blocks" and those bagholders
// TODO add "mempool" stage
// TODO when one char dies make the other cry?
// TODO when loading game and and another isntance oof game is already opened in another tab, it stalls at 100%
// TODO add game tutorial of some sorts
// TODO add inventory UI
// TODO add exchange
// TODO refactor code
// TODO fix receiving blocks doubled
// TODO consider Chef Nomi #SushiSwap
// TODO add more enemies and bosses
// TODO add moon ending scene
// TODO add Zeus
// TODO add Thor
// TODO turn miningfarm stage red and change music, when there's an attack on the citadel
// TODO add green cat (bisq)
// TODO add "Cobra"

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

  tick()
}

/**
 * @description Method to to execute game logic for each tick
 * It also takes care of rendering a frame at specified framerate
 */
function tick() {
  CTDLGAME.frame++
  if (CTDLGAME.startScreen) {
    clearCanvas()

    showStartScreen()
    if (window.SHOWBUTTONS) showButtons()
    showFrameRate()
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
  
  if (CTDLGAME.cutScene) {
    clearCanvas()

    writeMenu()
    showSettings()

    showFrameRate()
    return window.requestAnimationFrame(tick)
  }

  if (!CTDLGAME.hodlonaut || !CTDLGAME.world?.ready) {
    showFrameRate()

    return window.requestAnimationFrame(tick)
  }

  if (CTDLGAME.gameOver) {
    if (CTDLGAME.frame / constants.FRAMERATE % 16 === 0) CTDLGAME.frame = 0
    showGameOverScreen()

    if (window.SHOWBUTTONS) showButtons()

    showFrameRate()
    return window.requestAnimationFrame(tick)
  }


  if ((CTDLGAME.frame * 1.5) % constants.FRAMERATE === 0) {
    // TODO sometimes it happens that the background does not change
    circadianRhythm(time)
  }

  time = getTimeOfDay()
  if (CTDLGAME.frame !== 0 && CTDLGAME.frame % constants.CHECKBLOCKTIME === 0) checkBlocks()

  if (CTDLGAME.showShop) {
    showShop()
    showMenu(CTDLGAME.inventory)
    writeMenu()

    if (window.SHOWBUTTONS) showButtons()

    return window.requestAnimationFrame(tick)
  }

  if (CTDLGAME.prompt) {
    prompt(CTDLGAME.prompt)

    if (window.SHOWBUTTONS) showButtons()

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
        y: window.SELECTEDCHARACTER.y - 4
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

  executeHooks()

  updateViewport()

  CTDLGAME.quadTree.clear()
  CTDLGAME.objects
    .filter(obj => obj.inViewport)
    .forEach(object => CTDLGAME.quadTree.insert(object))

  if (CTDLGAME.showOverlay) showOverlay()

  showMenu(CTDLGAME.inventory)
  writeMenu()

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

  showFrameRate()
  return window.requestAnimationFrame(tick)
}

// Developer cheat codes
window.heal = () => {
  CTDLGAME.hodlonaut.heal(10)
  CTDLGAME.katoshi.heal(10)
}
window.revive = () => {
  CTDLGAME.hodlonaut.revive(21)
  CTDLGAME.katoshi.revive(21)
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