import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'
import { initSoundtrack, startMusic } from '../soundtrack'
import { addClass } from '../htmlUtils'
import Character from '../character'
import Brian from '../Brian'

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
  CTDLGAME.world = constants.WORLD

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