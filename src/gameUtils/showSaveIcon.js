import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'
import { drawIcon } from '../icons'
import { canDrawOn } from '../performanceUtils'

/**
 * @description Method to show save icon
 * @param {Number} opacity opacity value
 */
export const showSaveIcon = opacity => {
  if (!canDrawOn('menuContext')) return

  drawIcon(
    constants.menuContext,
    'save', {
      x: CTDLGAME.viewport.x + 3,
      y: CTDLGAME.viewport.y + 3,
      opacity
    }
  )
}