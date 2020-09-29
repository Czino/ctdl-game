import constants from '../constants'
import { CTDLGAME, setWorld } from './CTDLGAME'
import { initSoundtrack } from '../soundtrack'
import { addClass } from '../htmlUtils'
import { makeBoundary } from '../geometryUtils'
import Character from '../character'
import World from '../world'

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
  setWorld(new World('city'))

  CTDLGAME.objects = CTDLGAME.objects.concat([
    makeBoundary({ x: 0, y: 0, w: CTDLGAME.world.w, h: 12 }),
    makeBoundary({ x: CTDLGAME.world.w - 12, y: 0, w: 12, h: CTDLGAME.world.h }),
    makeBoundary({ x: 0, y: CTDLGAME.world.h - constants.GROUNDHEIGHT - constants.MENU.h, w: CTDLGAME.world.w, h: 12 }),
    makeBoundary({ x: 0, y: 0, w: 12, h: CTDLGAME.world.h })
  ])

  CTDLGAME.gameOver = false
  CTDLGAME.wizardCountdown = 64

  CTDLGAME.hodlonaut = new Character(
    'hodlonaut',
    {
      x: CTDLGAME.world.map.start.newGame.x - 10,
      y: CTDLGAME.world.map.start.newGame.y
    }
  )
  CTDLGAME.katoshi = new Character(
    'katoshi',
    {
      x: CTDLGAME.world.map.start.newGame.x + 10,
      y: CTDLGAME.world.map.start.newGame.y,
      active: false,
      direction: 'left'
    }
  )

  CTDLGAME.hodlonaut.select()

  CTDLGAME.objects.push(CTDLGAME.hodlonaut)
  CTDLGAME.objects.push(CTDLGAME.katoshi)

  CTDLGAME.objects.forEach(object => CTDLGAME.quadTree.insert(object))
  CTDLGAME.objects.forEach(object => object.update())

  initSoundtrack(CTDLGAME.world.map.track)

  setTimeout(() => addClass(constants.parallaxCanvas, 'transition-background-color'))
}