import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'
import { drawIcon } from '../icons'

/**
 * @description Method to render character's health
 * @returns {void}
 */
export const showHealth = () => {
  const pos = {
    x: constants.WIDTH + CTDLGAME.viewport.x - 30,
    y: constants.HEIGHT + CTDLGAME.viewport.y - constants.MENU.h + 2
  }
  const chars = [CTDLGAME.hodlonaut, CTDLGAME.katoshi]

  chars.map((character, i) => {
    drawIcon(
      constants.menuContext,
      character.id, {
        x: CTDLGAME.viewport.x + constants.WIDTH - 40,
        y: pos.y + 3 + i * 10
      }
    )

    for (let h = 0; h < 3; h++) {
      let percent = character.health / character.maxHealth
      let fill = h * (1 / 3) >= percent ?
        'empty' :
        h * (1 / 3) + 1 / 6 >= percent ?
        'half' :
        'full'

      drawIcon(
        constants.menuContext,
        'heart-' + fill, {
          x: CTDLGAME.viewport.x + constants.WIDTH - 30 + h * 9,
          y: pos.y + 3 + i * 10
        }
      )
    }
  })
}