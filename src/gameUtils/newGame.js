import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'
import { initSoundtrack, startMusic } from '../soundtrack'
import { addClass } from '../htmlUtils'
import Character from '../character'
import Brian from '../Brian'
import { makeBoundary } from '../geometryUtils'

/**
 * @description Method to prepare new game
 */
export const newGame = () => {
  CTDLGAME.inventory = { // TODO refactor into factory
    usd: 0,
    sats: 0,
    blocks: []
  }
  CTDLGAME.blockHeight = -1
  CTDLGAME.world = constants.WORLD

  CTDLGAME.objects = [
    makeBoundary({ x: 0, y: 0, w: CTDLGAME.world.w, h: 12 }),
    makeBoundary({ x: CTDLGAME.world.w - 12, y: 0, w: 12, h: CTDLGAME.world.h }),
    makeBoundary({ x: 0, y: CTDLGAME.world.h - constants.GROUNDHEIGHT - constants.MENU.h, w: CTDLGAME.world.w, h: 12 }),
    makeBoundary({ x: 0, y: 0, w: 12, h: CTDLGAME.world.h })
  ]

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

  const brian = new Brian(
    'brian',
    {
      x: 980,
      y: constants.WORLD.h - constants.GROUNDHEIGHT - constants.MENU.h - 30
    }
  )

  CTDLGAME.objects.push(brian)

  CTDLGAME.hodlonaut.select()

  CTDLGAME.objects.push(CTDLGAME.hodlonaut)
  CTDLGAME.objects.push(CTDLGAME.katoshi)

  CTDLGAME.objects.forEach(object => CTDLGAME.quadTree.insert(object))
  CTDLGAME.objects.forEach(object => object.update())

  initSoundtrack('stellaSplendence')
  if (CTDLGAME.options.music) startMusic()

  setTimeout(() => addClass(constants.parallaxCanvas, 'transition-background-color'))
}