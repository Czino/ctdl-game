import { CTDLGAME } from './CTDLGAME'
import { addTextToQueue } from '../textUtils'
import { newGame } from './newGame'
import { newGameButton } from '../eventUtils'

/**
 * @description Method to prepare new game
 */
export const showIntro = () => {
  newGameButton.active = false
  addTextToQueue([
    'Hello world'
  ].join('\n'), () => {
    window.SNDTRCK.stopMusic()
    newGame()
    CTDLGAME.cutScene = false
  }, true)
}