import constants from '../constants'
import { addClass, removeClass } from '../htmlUtils'

/**
 * @description Method to switch between day and night
 */
export const circadianRhythm = time => {
  if (time >= 5 && time < 5.1) {
    window.CTDLGAME.isNight = false
    addClass(constants.gameCanvas, 'ctdl-day')
  } else if (time >= 18 && time < 18.1) {
    window.CTDLGAME.isNight = true
    removeClass(constants.gameCanvas, 'ctdl-day')
  }
}