import constants from '../constants'
import { CTDLGAME, skipText } from '../gameUtils'
import { playSound } from '../sounds'
import { nahButton, yesButton } from './buttons'
import { click } from './click'
import { clickEnd } from './clickEnd'
import handleStartScreenKeyEvents from './handleStartScreenKeyEvents'
import { mouseMove } from './mouseMove'
import { mouseMoveHandler } from './mouseMoveHandler'
import startScreenHandler from './startScreenHandler'
import { switchCharacter } from './switchCharacter'
import { zoomHandler } from './zoomHandler'

window.KEYS = []
window.BUTTONS = []
CTDLGAME.menuItem = 0
CTDLGAME.menuItemX = 0

// TODO add throttling to events

window.addEventListener('mousemove', mouseMoveHandler)
window.addEventListener('mouseup', startScreenHandler)
window.addEventListener('touchstart', startScreenHandler)

const resize = () => {
  constants.canvases.forEach(canvas => {
    canvas.style.height = (Math.round(window.innerHeight / 2) * 2) + 'px'
  })
}

export const initEvents = startScreen => {
  try {
    document.createEvent('TouchEvent')
    CTDLGAME.touchScreen = true
  } catch (e) {
    CTDLGAME.touchScreen = false
  }
  window.removeEventListener('keydown', handleStartScreenKeyEvents)

  if (startScreen) {
    window.removeEventListener('mousedown',click)
    window.removeEventListener('touchstart', click)
    window.removeEventListener('mouseup', clickEnd)
    window.removeEventListener('touchend', clickEnd)
    window.removeEventListener('mousemove', mouseMove)
    window.removeEventListener('touchmove', mouseMove)
    window.removeEventListener('touchstart', zoomHandler)
    window.removeEventListener('touchmove', zoomHandler)
    window.addEventListener('resize', resize)
    window.addEventListener('keydown', handleStartScreenKeyEvents)

    constants.BUTTONS
      .filter(button => /newGame|loadGame/.test(button.action))
      .forEach(button => button.active = true)
    return
  }

  if (CTDLGAME.touchScreen) {
    window.addEventListener('touchstart', click)
    window.addEventListener('touchend', clickEnd)
    window.addEventListener('touchmove', mouseMove)
    window.addEventListener('touchstart', zoomHandler)
    window.addEventListener('touchmove', zoomHandler)
  } else {
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ') skipText()
    })
    window.addEventListener('mousedown', click)
    window.addEventListener('mouseup', clickEnd)
    window.addEventListener('mousemove', mouseMove)
  }

  window.addEventListener('keydown', e => {
    let key = e.key.toLowerCase()
    e.preventDefault()
    if (key === 'tab') {
      switchCharacter()
    }
    if (CTDLGAME.showShop) {
      if (/^[sk]|arrowdown$/.test(key)) {
        playSound('select')
        CTDLGAME.menuItem++
      }
      if (/^[wi]|arrowup$/.test(key)) {
        playSound('select')
        CTDLGAME.menuItem--
      }
      if (key === 'enter' && CTDLGAME.eventButtons[CTDLGAME.menuItem]) {
        CTDLGAME.eventButtons[CTDLGAME.menuItem].onclick()
      }
      if (key === 'escape' ) {
        playSound('select')
        CTDLGAME.eventButtons[CTDLGAME.eventButtons.length - 1].onclick()
      }
    }
    if (CTDLGAME.prompt) {
      if (/^[aj]|arrowleft$/.test(key)) {
        playSound('select')
        CTDLGAME.menuItemX++
      }
      if (/^[dl]|arrowright$/.test(key)) {
        playSound('select')
        CTDLGAME.menuItemX--
      }
      if (key === 'enter') {
        playSound('select')
        CTDLGAME.menuItemX === 0 ? yesButton.onclick() : nahButton.onclick()
      }
      if (key === 'escape') {
        playSound('select')
        nahButton.onclick()
      }
    }

    if (window.KEYS.indexOf(key) !== -1) return
    if (key === 'd' && window.KEYS.indexOf('a') !== -1) window.KEYS = window.KEYS.filter(key => key !== 'a')
    if (key === 'a' && window.KEYS.indexOf('d') !== -1) window.KEYS = window.KEYS.filter(key => key !== 'd')
    if (key === 'j' && window.KEYS.indexOf('l') !== -1) window.KEYS = window.KEYS.filter(key => key !== 'l')
    if (key === 'l' && window.KEYS.indexOf('j') !== -1) window.KEYS = window.KEYS.filter(key => key !== 'j')

    window.KEYS.push(key)
  })

  window.addEventListener('keyup', e => {
    if (e.key.toLowerCase() === 'enter') {
      skipText()
    }
    window.KEYS = window.KEYS.filter(key => {
      return key !== e.key.toLowerCase()
    })
  })
}

export default initEvents