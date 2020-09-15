import constants from '../constants'
import { showInventory } from './showInventory'
import { showHealth } from './showHealth'
import { showSettings } from './showSettings'
import { showControls } from './showControls'

export const showMenu = inventory => {
  constants.menuContext.fillStyle = '#212121'
  constants.menuContext.fillRect(
    window.CTDLGAME.viewport.x,
    window.CTDLGAME.viewport.y + constants.HEIGHT - constants.MENU.h,
    constants.MENU.w,
    constants.MENU.h
  )

  showInventory(inventory)
  showHealth()
  showSettings()
  if (window.CTDLGAME.touchScreen) showControls()
}