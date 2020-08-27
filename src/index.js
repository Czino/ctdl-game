import * as db from './db'
import { QuadTree, Boundary } from './quadTree'
import Character from './character'
import Block from './block'
import Sun from './sun'
import Moon from './moon'
import initEvents, { updateOverlay } from './events'
import constants from './constants'
import { assets, loadAsset, showProgressBar, updateViewport, showInventory, writeMenu, addTextToQueue, saveGame, checkBlocks, getTimeOfDay } from './gameUtils'
import { drawIcon } from './icons'
import { addClass, removeClass, hasClass } from './htmlUtils'

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
  let time = await db.get('time')
  
  if (time) {
    let viewport = await db.get('viewport')
    let hodlonaut = await db.get('hodlonaut')
    let katoshi = await db.get('katoshi')
    let objects = await db.get('objects')
    let blockHeight = await db.get('blockHeight')
    let inventory = await db.get('inventory')

    if (time) CTDLGAME.frame = time
    if (viewport) {
      CTDLGAME.viewport = viewport
      updateViewport(CTDLGAME.viewport)
    }
    if (objects) {
      CTDLGAME.objects = objects.map(object => {
        if (object.class === 'Block') {
          return new Block(
            object.id,
            constants.gameContext,
            CTDLGAME.quadTree,
            object
          )
        }
      })
    }
    if (blockHeight) CTDLGAME.blockHeight = blockHeight
    if (inventory) CTDLGAME.inventory = inventory

    CTDLGAME.hodlonaut = new Character(
      'hodlonaut',
      constants.charContext,
      CTDLGAME.quadTree,
      hodlonaut
    )
    CTDLGAME.katoshi = new Character(
      'katoshi',
      constants.charContext,
      CTDLGAME.quadTree,
      katoshi
    )
  } else {
    let ground = new Block('ground', constants.gameContext, CTDLGAME.quadTree, {
      x: 0,
      y: constants.WORLD.h - constants.GROUNDHEIGHT - constants.MENU.h,
      w: constants.WORLD.w,
      h: constants.GROUNDHEIGHT,
      isStatic: true,
      isSolid: true
    })

    CTDLGAME.hodlonaut = new Character(
      'hodlonaut',
      constants.charContext,
      CTDLGAME.quadTree,
      {
        x: CTDLGAME.viewport.x + 1,
        y: constants.WORLD.h - constants.GROUNDHEIGHT  - constants.MENU.h - 30
      }
    )
    CTDLGAME.katoshi = new Character(
      'katoshi',
      constants.charContext,
      CTDLGAME.quadTree,
      {
        active: false,
        x: CTDLGAME.viewport.x + constants.WIDTH / 2,
        y: constants.WORLD.h - constants.GROUNDHEIGHT - constants.MENU.h - 30,
        direction: 'left'
      }
    )

    CTDLGAME.objects.push(ground)

    addTextToQueue('Hodlonaut and Katoshi find \nthemselves in an unfamiliar region')
  }

  CTDLGAME.objects.push(CTDLGAME.hodlonaut)
  CTDLGAME.objects.push(CTDLGAME.katoshi)

  CTDLGAME.hodlonaut.select()

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
  if (time > 18) {
    removeClass(constants.gameCanvas, 'ctdl-day')
  } else if (time > 6) {
    addClass(constants.gameCanvas, 'ctdl-day')
  }
  setTimeout(() => addClass(constants.gameCanvas, 'transition-background-color'))

  tick()
}
async function tick() {
  if (CTDLGAME.frame % constants.FRAMERATE === 0) {
    time = getTimeOfDay()
    if (CTDLGAME.frame !== 0 && CTDLGAME.frame % constants.CHECKBLOCKTIME === 0) {
      checkBlocks(CTDLGAME.blockHeight ? CTDLGAME.blockHeight : null)
    }

    if (time === 6) {
      addClass(constants.gameCanvas, 'ctdl-day')
    } else if (time === 18) {
      removeClass(constants.gameCanvas, 'ctdl-day')
    }
    constants.gameContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
    constants.charContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
    constants.menuContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)

    // apply gravity
    CTDLGAME.hodlonaut.vy += constants.GRAVITY
    CTDLGAME.katoshi.vy += constants.GRAVITY

    CTDLGAME.objects.forEach(object => object.update())
    CTDLGAME.viewport = {
      x: Math.round((CTDLGAME.hodlonaut.x + CTDLGAME.katoshi.x) / 2 - constants.WIDTH / 2),
      y: Math.min(
        constants.WORLD.h - constants.HEIGHT,
        Math.round((CTDLGAME.hodlonaut.y + CTDLGAME.katoshi.y) / 2))
    }
    sun.update()
    moon.update()

    updateViewport(CTDLGAME.viewport)
    updateOverlay()

    showInventory(CTDLGAME.inventory)

    writeMenu()

    // window.SHOWQUAD = true
    // blocks = blocks.map(block => moveBlock(block, {x: 0, y: 1}))
    CTDLGAME.quadTree.clear()
    if (window.SHOWQUAD) constants.gameContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
    CTDLGAME.objects.forEach(object => CTDLGAME.quadTree.insert(object))
    if (window.SHOWQUAD) CTDLGAME.quadTree.show(constants.gameContext)

    if (CTDLGAME.frame !== 0 && CTDLGAME.frame % constants.SAVERATE === 0) {
      saveGame(db)
    }
    // fade out save icon
    if (CTDLGAME.frame > 256 && CTDLGAME.frame % constants.SAVERATE < 256) {
      drawIcon(
        constants.menuContext,
        'save',
        {
          x: CTDLGAME.viewport.x + constants.WIDTH - 10,
          y: CTDLGAME.viewport.y + 3,
          opacity: (256 - CTDLGAME.frame % constants.SAVERATE) / 256
        }
      )
    }

    if (CTDLGAME.frame > constants.FRAMERESET) {
      CTDLGAME.frame = 0
    }
  }

  CTDLGAME.frame++
  window.requestAnimationFrame(tick)
}