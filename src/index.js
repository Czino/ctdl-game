import * as db from './db'
import { QuadTree, Boundary } from './quadTree'
import Sun from './sun'
import Moon from './moon'
import initEvents, { updateOverlay } from './events'
import constants from './constants'
import { assets, loadAsset, showProgressBar, updateViewport, showInventory, writeMenu, saveGame, checkBlocks, getTimeOfDay, showSaveIcon, clearCanvas, loadGame, newGame } from './gameUtils'
import { addClass, removeClass } from './htmlUtils'

import Shitcoiner from './shitcoiner'
import { intersects } from './geometryUtils'

window.KEYS = []
window.SELECTED = null

window.CTDLGAME = {
  cursor: {x: 0, y: 0},
  frame: 0,
  assets,
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
  await db.init(constants.debug)

  if (!(await loadGame())) {
    newGame()
  }

  CTDLGAME.objects.push(CTDLGAME.hodlonaut)
  CTDLGAME.objects.push(CTDLGAME.katoshi)

  let i = 0
  for (let key in CTDLGAME.assets) {
    CTDLGAME.assets[key] = await loadAsset(CTDLGAME.assets[key])
    constants.overlayContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)

    showProgressBar(i / (Object.keys(CTDLGAME.assets).length - 1))
    i++
  }
  initEvents()

  CTDLGAME.objects.forEach(object => CTDLGAME.quadTree.insert(object))
  CTDLGAME.objects.forEach(object => object.update())

  constants.overlayContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
  if (CTDLGAME.blockHeight < 0) checkBlocks(0)

  time = getTimeOfDay()
  if (time > 18.5) {
    CTDLGAME.isNight = true
    removeClass(constants.gameCanvas, 'ctdl-day')
  } else if (time > 5.5) {
    CTDLGAME.isNight = false
    addClass(constants.gameCanvas, 'ctdl-day')
  }

  setTimeout(() => {
    addClass(constants.gameCanvas, 'transition-background-color')
    tick()
  })

}
async function tick() {
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

    CTDLGAME.viewport = {
      x: Math.round((CTDLGAME.hodlonaut.x + CTDLGAME.katoshi.x) / 2 - constants.WIDTH / 2),
      y: Math.min(
        constants.WORLD.h - constants.HEIGHT,
        Math.round((CTDLGAME.hodlonaut.y + CTDLGAME.katoshi.y) / 2))
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

    showInventory(CTDLGAME.inventory)

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