import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'
import { addClass } from '../htmlUtils'
import Character from '../character'
import { changeMap } from '../mapUtils'

/**
 * @description Method to prepare new game
 * @returns {void}
 */
export const newGame = async () => {
  CTDLGAME.inventory = { // TODO refactor into factory
    usd: 0,
    sats: 0,
    blocks: []
  }
  CTDLGAME.blockHeight = -1 // set blockHeight to -1 to enable fetching genesis block

  CTDLGAME.hodlonaut = new Character(
    'hodlonaut',
    {}
  )
  CTDLGAME.katoshi = new Character(
    'katoshi',
    {
      active: false,
      direction: 'left'
    }
  )

  CTDLGAME.startedNewGame = true
  CTDLGAME.hodlonaut.select()

  CTDLGAME.objects.push(CTDLGAME.hodlonaut)
  CTDLGAME.objects.push(CTDLGAME.katoshi)

  CTDLGAME.gameOver = false
  CTDLGAME.wizardCountdown = 64

  await changeMap('city', 'newGame')

  CTDLGAME.objects.forEach(object => CTDLGAME.quadTree.insert(object))
  CTDLGAME.objects.forEach(object => object.update())

  CTDLGAME.frame = 6096 + 250
  setTimeout(() => addClass(constants.parallaxCanvas, 'transition-background-color'))
}