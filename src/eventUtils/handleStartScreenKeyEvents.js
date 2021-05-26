import { CTDLGAME } from '../gameUtils'
import { playSound } from '../sounds'
import { loadGameButton, newGameButton } from './buttons'

export const handleStartScreenKeyEvents = e => {
  let key = e.key.toLowerCase()
  e.preventDefault()

  if (loadGameButton.active) {
    if (/^[sk]|arrowdown$/.test(key)) {
      playSound('select')
      CTDLGAME.menuItem++
    }
    if (/^[wi]|arrowup$/.test(key)) {
      playSound('select')
      CTDLGAME.menuItem--
    }
  }
  if (/^[aj]|arrowleft$/.test(key)) {
    playSound('select')
    CTDLGAME.multiPlayer = !CTDLGAME.multiPlayer
    CTDLGAME.menuItemX--
  }
  if (/^[dl]|arrowright$/.test(key)) {
    playSound('select')
    CTDLGAME.multiPlayer = !CTDLGAME.multiPlayer
    CTDLGAME.menuItemX++
  }
  if (key === 'enter') {
    CTDLGAME.menuItem === 0 ? newGameButton.onclick() : loadGameButton.onclick()
  }
}

export default handleStartScreenKeyEvents