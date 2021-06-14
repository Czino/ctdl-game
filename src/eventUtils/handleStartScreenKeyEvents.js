import { CTDLGAME } from '../gameUtils'
import { loadGameButton, newGameButton } from './buttons'

export const handleStartScreenKeyEvents = e => {
  let key = e.key.toLowerCase()
  e.preventDefault()

  if (loadGameButton.active) {
    if (/^[sk]|arrowdown$/.test(key)) {
      window.SOUND.playSound('select')
      CTDLGAME.menuItem++
    }
    if (/^[wi]|arrowup$/.test(key)) {
      window.SOUND.playSound('select')
      CTDLGAME.menuItem--
    }
  }
  if (/^[aj]|arrowleft$/.test(key)) {
    window.SOUND.playSound('select')
    CTDLGAME.multiPlayer = !CTDLGAME.multiPlayer
    CTDLGAME.menuItemX--
  }
  if (/^[dl]|arrowright$/.test(key)) {
    window.SOUND.playSound('select')
    CTDLGAME.multiPlayer = !CTDLGAME.multiPlayer
    CTDLGAME.menuItemX++
  }
  if (key === 'enter') {
    CTDLGAME.menuItem === 0
      ? newGameButton.active
        ? newGameButton.onclick()
        : null
      : loadGameButton.active
        ? loadGameButton.onclick()
        : null
  }
}

export default handleStartScreenKeyEvents