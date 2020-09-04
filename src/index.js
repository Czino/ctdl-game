import * as db from './db'
import { QuadTree, Boundary } from './quadTree'
import Sun from './sun'
import Moon from './moon'
import { initEvents, updateOverlay } from './events'
import constants from './constants'
import {
  assets,
  loadAsset,
  showStartScreen,
  showProgressBar,
  updateViewport,
  showMenu,
  writeMenu,
  saveGame,
  checkBlocks,
  getTimeOfDay,
  showSaveIcon,
  clearCanvas,
  saveStateExists
} from './gameUtils'
import { addClass, removeClass } from './htmlUtils'

import Shitcoiner from './shitcoiner'
import { intersects } from './geometryUtils'

window.SELECTED = null

window.CTDLGAME = {
  cursor: {x: 0, y: 0},
  frame: 0,
  assets,
  startScreen: true,
  touchScreen: true,
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
  if (CTDLGAME.blockHeight < 0) checkBlocks(0)

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

  if ((CTDLGAME.frame * 1.5) % constants.FRAMERATE === 0) {
    if (time >= 5 && time < 5.1) {
      CTDLGAME.isNight = false
      addClass(constants.gameCanvas, 'ctdl-day')
    } else if (time >= 18 && time < 18.1) {
      CTDLGAME.isNight = true
      removeClass(constants.gameCanvas, 'ctdl-day')
    }
  }
  if (CTDLGAME.frame % constants.FRAMERATE === 0) {
    time = getTimeOfDay()
    if (CTDLGAME.frame !== 0 && CTDLGAME.frame % constants.CHECKBLOCKTIME === 0) {
      checkBlocks()
    }

    clearCanvas()

    if (CTDLGAME.multiplayer) {
      CTDLGAME.viewport = {
        x: Math.round((CTDLGAME.hodlonaut.x + CTDLGAME.katoshi.x) / 2 - constants.WIDTH / 2),
        y: Math.min(
          constants.WORLD.h - constants.HEIGHT,
          Math.round((CTDLGAME.hodlonaut.y + CTDLGAME.katoshi.y) / 2))
      }
    } else if (window.SELECTED?.class === 'Character') {
      CTDLGAME.viewport = {
        x: Math.round(window.SELECTED.x + window.SELECTED.w / 2 - constants.WIDTH / 2),
        y: Math.min(
          constants.WORLD.h - constants.HEIGHT,
          Math.round(window.SELECTED.y + window.SELECTED.h / 2))
      }
    } else {
      CTDLGAME.viewport = {
        x: Math.round(CTDLGAME.hodlonaut.x + CTDLGAME.hodlonaut.w / 2 - constants.WIDTH / 2),
        y: Math.min(
          constants.WORLD.h - constants.HEIGHT,
          Math.round(CTDLGAME.hodlonaut.y + CTDLGAME.hodlonaut.h / 2))
      }
    }

    if (CTDLGAME.isNight) {
      if (Math.random() < constants.SPAWNRATES.shitcoiner) {
        let shitcoiner = new Shitcoiner(
          'shitcoiner-' + Math.random(),
          constants.gameContext,
          CTDLGAME.quadTree,
          {
            x: CTDLGAME.viewport.x + Math.round(Math.random() * constants.WIDTH),
            y: constants.WORLD.h - constants.GROUNDHEIGHT  - constants.MENU.h - 30,
            status: 'spawn'
          }
        )

        let hasCollided = CTDLGAME.quadTree.query(shitcoiner.getBoundingBox())
          .filter(point => point.isSolid && point.id !== shitcoiner.id )
          .some(point => intersects(shitcoiner.getBoundingBox(), point.getBoundingBox()))
        if (!hasCollided) CTDLGAME.objects.push(shitcoiner)
      }
    } else {
      CTDLGAME.objects = CTDLGAME.objects.filter(obj => {
        if (obj.class !== 'Shitcoiner') return true
        if (obj.status !== 'rekt' && obj.status !== 'burning') return true
        if (obj.status === 'burning' && Math.random() < .25) {
          return false
        }

        obj.status = 'burning'
        return true
      })
    }

    sun.update()
    moon.update()

    // apply gravity
    CTDLGAME.hodlonaut.vy += constants.GRAVITY
    CTDLGAME.katoshi.vy += constants.GRAVITY
    CTDLGAME.objects
      .filter(obj => obj.enemy)
      .map(enemy => enemy.vy += constants.GRAVITY)

    CTDLGAME.objects.forEach(object => object.update())

    updateViewport(CTDLGAME.viewport)
    updateOverlay()

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
      showSaveIcon()
    }

    if (CTDLGAME.frame > constants.FRAMERESET) {
      CTDLGAME.frame = 0
    }
  }

  CTDLGAME.frame++
  window.requestAnimationFrame(tick)
}