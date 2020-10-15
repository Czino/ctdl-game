import { CTDLGAME } from './CTDLGAME'

/**
 * @description Method to switch between day and night
 * @returns {void}
 */
export const circadianRhythm = time => {
  if (time >= 5 && time < 5.1) {
    CTDLGAME.isNight = false
  } else if (time >= 18 && time < 18.1) {
    CTDLGAME.isNight = true
  }
}