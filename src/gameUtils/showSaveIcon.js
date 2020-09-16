import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'
import { drawIcon } from '../icons'

/**
 * @description Method to show save icon
 * @param {Number} opacity opacity value
 */
export const showSaveIcon = opacity => {
  drawIcon(
    constants.menuContext,
    'save', {
      x: CTDLGAME.viewport.x + 3,
      y: CTDLGAME.viewport.y + 3,
      opacity
    }
  )
}