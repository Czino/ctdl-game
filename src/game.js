import constants from './constants'
import * as db from './db'
import { buttons, initEvents, initGameButton, loadGameButton } from './eventUtils'
import {
  CTDLGAME,
  clearCanvas,
  getTimeOfDay,
  loadAsset,
  saveGame,
  saveStateExists,
  showProgressBar,
  showStartScreen
} from './gameUtils'
import { changeMap } from './mapUtils'
import Item from './objects/Item'
import { addTextToQueue } from './textUtils'

// window.SOUND.playSound('robotRekt')
// setInterval(() => window.SOUND.playSound('robotRekt'), 5000)

window.SELECTED = null
window.SELECTEDCHARACTER = null

// TODO ADD ATTACK BOXES EVERYWHERE!
let time

init()

let assetsLoaded = 0
let initialAssetCount = Object.keys(CTDLGAME.assets).length


/**
 * @description Method to init the game
 * @returns {void}
 */
async function init() {

  constants.BUTTONS = constants.BUTTONS.concat(buttons)
  for (let key in CTDLGAME.assets) {
    loadAsset(CTDLGAME.assets[key]).then(asset => {
      CTDLGAME.assets[key] = asset
      assetsLoaded++
    })
  }
  for (let key in CTDLGAME.assets) {
    loadAsset(CTDLGAME.assets[key]).then(asset => {
      CTDLGAME.assets[key] = asset
      assetsLoaded++
    })
  }
  for (let key in CTDLGAME.assets) {
    loadAsset(CTDLGAME.assets[key]).then(asset => {
      CTDLGAME.assets[key] = asset
      assetsLoaded++
    })
  }

  await db.init(constants.debug)

  let options = await db.get('options')
  if (options) CTDLGAME.options = options
  window.SNDTRCK.toggleSoundtrack(CTDLGAME.options.music)
  window.SOUND.toggleSounds(CTDLGAME.options.sound)

  CTDLGAME.isSoundLoaded = window.SOUND.isSoundLoaded()

  if (CTDLGAME.isSoundLoaded) {
    initGameButton.active = false
    if (!(await saveStateExists())) {
      CTDLGAME.newGame = true
    } else {
      loadGameButton.active = true
      CTDLGAME.menuItem = 1
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

  if (!CTDLGAME.loaded) {
    clearCanvas()
    showProgressBar(assetsLoaded / (initialAssetCount * 3))
    CTDLGAME.loaded = assetsLoaded === initialAssetCount * 3
    return window.requestAnimationFrame(tick)
  }
  if (CTDLGAME.startScreen) {
    clearCanvas()
    showStartScreen()
    return window.requestAnimationFrame(tick)
  } else if (CTDLGAME.frame % constants.FRAMERATE !== 0) {
    // throttle framerate
    return window.requestAnimationFrame(tick)
  }


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