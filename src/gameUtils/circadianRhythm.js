import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'

import { addClass, removeClass } from '../htmlUtils'

/**
 * @description Method to switch between day and night
 */
export const circadianRhythm = time => {
  if (time >= 5 && time < 5.1) {
    CTDLGAME.isNight = false
    addClass(constants.parallexCanvas, 'ctdl-day')
  } else if (time >= 18 && time < 18.1) {
    CTDLGAME.isNight = true
    removeClass(constants.parallexCanvas, 'ctdl-day')
  }
}