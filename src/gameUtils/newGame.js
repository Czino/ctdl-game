import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'
import { initSoundtrack, startMusic } from '../soundtrack'
import { addClass } from '../htmlUtils'
import Character from '../character'
import Block from '../block'

/**
 * @description Method to prepare new game
 */
export const newGame = () => {
  CTDLGAME.objects = []
  CTDLGAME.inventory = { // TODO refactor into factory
    usd: 0,
    sats: 0,
    blocks: []
  }
  CTDLGAME.blockHeight = -1

  const ground = new Block('ground', constants.gameContext, {
    x: 0,
    y: constants.WORLD.h - constants.GROUNDHEIGHT - constants.MENU.h,
    w: constants.WORLD.w,
    h: constants.GROUNDHEIGHT,
    isSolid: true
  })

  CTDLGAME.gameOver = false
  CTDLGAME.wizardCountdown = 16

  CTDLGAME.hodlonaut = new Character(
    'hodlonaut',
    {
      x: CTDLGAME.viewport.x + 50,
      y: constants.WORLD.h - constants.GROUNDHEIGHT - constants.MENU.h - 30
    }
  )
  CTDLGAME.katoshi = new Character(
    'katoshi',
    {
      active: false,
      x: CTDLGAME.viewport.x + constants.WIDTH / 2,
      y: constants.WORLD.h - constants.GROUNDHEIGHT - constants.MENU.h - 30,
      direction: 'left'
    }
  )

  CTDLGAME.objects.push(ground)

  CTDLGAME.hodlonaut.select()

  CTDLGAME.objects.push(CTDLGAME.hodlonaut)
  CTDLGAME.objects.push(CTDLGAME.katoshi)

  CTDLGAME.objects.forEach(object => CTDLGAME.quadTree.insert(object))
  CTDLGAME.objects.forEach(object => object.update())

  initSoundtrack('stellaSplendence')
  if (CTDLGAME.options.music) startMusic()

  setTimeout(() => addClass(constants.gameCanvas, 'transition-background-color'))
}