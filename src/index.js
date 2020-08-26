import * as db from './db'
import { QuadTree, Boundary } from './quadTree'
import Character from './character'
import Block from './block'
import initEvents, { updateOverlay } from './events'
import constants from './constants'
import { assets, loadAsset, showProgressBar, updateViewport, showInventory, writeMenu, addTextToQueue, saveGame } from './gameUtils'
import { drawIcon } from './icons'

window.KEYS = []
window.SELECTED = null

window.CTDLGAME = {
  cursor: {x: 0, y: 0},
  frame: 0,
  assets,
  viewport: constants.START,
  objects: [],
  blockHeight: null,
  inventory: {
    blocks: []
  },
  quadTree: new QuadTree(new Boundary({
    x: 0,
    y: 0,
    ...constants.WORLD
  }))
}

init()

async function init() {
  const newGame = await db.init(constants.debug)

  if (!newGame) {
    let viewport = await db.get('viewport')
    let hodlonaut = await db.get('hodlonaut')
    let katoshi = await db.get('katoshi')
    let objects = await db.get('objects')
    let blockHeight = await db.get('blockHeight')
    let inventory = await db.get('inventory')

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

  saveGame(db)

  // addTextToQueue('I am hodlonaut!')
  tick()
}
async function tick() {
  if (CTDLGAME.frame % constants.FRAMERATE === 0) {
    constants.gameContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
    constants.charContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
    constants.menuContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)

    // apply gravity
    CTDLGAME.hodlonaut.vy += constants.GRAVITY
    CTDLGAME.katoshi.vy += constants.GRAVITY

    CTDLGAME.objects.forEach(object => object.update())
    CTDLGAME.viewport = {
      x: (CTDLGAME.hodlonaut.x + CTDLGAME.katoshi.x) / 2 - constants.WIDTH / 2,
      y: Math.min(
        constants.WORLD.h - constants.HEIGHT,
        (CTDLGAME.hodlonaut.y + CTDLGAME.katoshi.y) / 2)
    }

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
  }

  CTDLGAME.frame++
  window.requestAnimationFrame(tick)
}