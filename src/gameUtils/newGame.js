import constants from '../constants'
import { initSoundtrack, startMusic } from '../soundtrack'
import { addClass } from '../htmlUtils'
import Character from '../character'
import Block from '../block'

/**
 * @description Method to prepare new game
 */
export const newGame = () => {
  window.CTDLGAME.objects = []
  window.CTDLGAME.inventory = { // TODO refactor into factory
    usd: 0,
    sats: 0,
    blocks: []
  }
  window.CTDLGAME.blockHeight = -1

  const ground = new Block('ground', constants.gameContext, window.CTDLGAME.quadTree, {
    x: 0,
    y: constants.WORLD.h - constants.GROUNDHEIGHT - constants.MENU.h,
    w: constants.WORLD.w,
    h: constants.GROUNDHEIGHT,
    isStatic: true,
    isSolid: true
  })

  window.CTDLGAME.gameOver = false
  window.CTDLGAME.wizardCountdown = 16

  window.CTDLGAME.hodlonaut = new Character(
    'hodlonaut',
    constants.charContext,
    window.CTDLGAME.quadTree, {
      x: window.CTDLGAME.viewport.x + 50,
      y: constants.WORLD.h - constants.GROUNDHEIGHT - constants.MENU.h - 30
    }
  )
  window.CTDLGAME.katoshi = new Character(
    'katoshi',
    constants.charContext,
    window.CTDLGAME.quadTree, {
      active: false,
      x: window.CTDLGAME.viewport.x + constants.WIDTH / 2,
      y: constants.WORLD.h - constants.GROUNDHEIGHT - constants.MENU.h - 30,
      direction: 'left'
    }
  )

  window.CTDLGAME.objects.push(ground)

  window.CTDLGAME.hodlonaut.select()

  window.CTDLGAME.objects.push(window.CTDLGAME.hodlonaut)
  window.CTDLGAME.objects.push(window.CTDLGAME.katoshi)

  window.CTDLGAME.objects.forEach(object => window.CTDLGAME.quadTree.insert(object))
  window.CTDLGAME.objects.forEach(object => object.update())

  initSoundtrack('stellaSplendence')
  startMusic()
  setTimeout(() => addClass(constants.gameCanvas, 'transition-background-color'))
}