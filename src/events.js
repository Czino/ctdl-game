import { contains } from './geometryUtils'
import constants from './constants'
import { newGame, loadGame, showOverlay } from './gameUtils'
import { addTextToQueue, skipText } from './textUtils'
import { addClass, removeClass } from './htmlUtils'
import { stopMusic, startMusic } from './soundtrack'
import { playSound, toggleSounds } from './sounds'


window.KEYS = []
window.BUTTONS = []

export const initEvents = startScreen => {
  try {
    document.createEvent('TouchEvent')
    window.CTDLGAME.touchScreen = true
  } catch (e) {
    window.CTDLGAME.touchScreen = false
  }

  if (startScreen) {
    window.removeEventListener('mousedown', click)
    window.removeEventListener('mousedown', skipText)
    window.removeEventListener('touchstart', click)
    window.removeEventListener('touchstart', skipText)
    window.removeEventListener('mouseup', clickEnd)
    window.removeEventListener('touchend', clickEnd)
    window.removeEventListener('mousemove', mouseMove)
    window.removeEventListener('touchmove', mouseMove)
    window.addEventListener('mousemove', mouseMoveHandler)
    window.addEventListener('mousedown', startScreenHandler)
    window.addEventListener('touchstart', startScreenHandler)
    return
  }

  window.addEventListener('mousedown', click)
  window.addEventListener('mousedown', skipText)
  window.addEventListener('touchstart', click)
  window.addEventListener('touchstart', skipText)
  window.addEventListener('mouseup', clickEnd)
  window.addEventListener('touchend', clickEnd)
  window.addEventListener('mousemove', mouseMove)
  window.addEventListener('touchmove', mouseMove)

  window.addEventListener('keydown', e => {
    if (!window.CTDLGAME.multiplayer) {
      if (Object.keys(constants.CONTROLS.katoshi).indexOf(e.key.toLowerCase()) !== -1) {
        window.CTDLGAME.multiplayer = true
        addTextToQueue('Multiplayer activated')
      }
    }
    KEYS.push(e.key.toLowerCase());
  })

  window.addEventListener('keyup', e => {
    if (e.key.toLowerCase() === 'enter') {
      skipText()
    }
    KEYS = KEYS.filter(key => {
      return key !== e.key.toLowerCase()
    })
  })
}


function mouseMoveHandler (e) {
  let canvas = e.target

  if (!/ctdl-game/.test(canvas.id)) {
    return
  }

  if (e.layerX) {
    window.CTDLGAME.cursor = {
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height')
    }
  }
  let buttonHover = constants.BUTTONS.find(button =>
    button.active &&
    window.CTDLGAME.cursor.x > button.x &&
    window.CTDLGAME.cursor.x < button.x + button.w &&
    window.CTDLGAME.cursor.y > button.y &&
    window.CTDLGAME.cursor.y < button.y + button.h
  )

  if (buttonHover) {
    addClass(document.body, 'cursor-pointer')
  } else {
    removeClass(document.body, 'cursor-pointer')
  }
}

async function startScreenHandler (e) {
  let canvas = e.target
  if (!/ctdl-game/.test(canvas.id)) {
    return
  }

  if (e.layerX) {
    window.CTDLGAME.cursor = {
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height')
    }
  } else if (e.touches?.length > 0) {
    e.stopPropagation()
    window.CTDLGAME.cursor = {
      x: (e.touches[0].clientX - e.target.offsetLeft) / canvas.clientWidth * canvas.getAttribute('width'),
      y: (e.touches[0].clientY - e.target.offsetTop) / canvas.clientHeight * canvas.getAttribute('height')
    }
    window.CTDLGAME.touchScreen = true

    constants.BUTTONS
      .filter(button => /moveLeft|moveRight|jump|back|attack/.test(button.action))
      .forEach(button => button.active = true)
  }
  let buttonPressed = constants.BUTTONS.find(button =>
    button.active &&
    window.CTDLGAME.cursor.x > button.x &&
    window.CTDLGAME.cursor.x < button.x + button.w &&
    window.CTDLGAME.cursor.y > button.y &&
    window.CTDLGAME.cursor.y < button.y + button.h
  )

  if (buttonPressed?.action === 'newGame') {
    playSound('select')

    newGame()
    window.CTDLGAME.startScreen = false

    constants.BUTTONS
      .filter(button => /newGame|loadGame/.test(button.action))
      .forEach(button => button.active = false)

    window.removeEventListener('mouseup', startScreenHandler)
    window.removeEventListener('touchend', startScreenHandler)
    initEvents(false)
  } else if (buttonPressed?.action === 'loadGame') {
    playSound('select')

    window.CTDLGAME.startScreen = false
    await loadGame()

    constants.BUTTONS
      .filter(button => /newGame|loadGame/.test(button.action))
      .forEach(button => button.active = false)

    window.removeEventListener('mouseup', startScreenHandler)
    window.removeEventListener('touchend', startScreenHandler)
    initEvents(false)
  } else if (buttonPressed?.action === 'music') {
    window.CTDLGAME.options.music = !window.CTDLGAME.options.music
    if (!window.CTDLGAME.options.music) {
      stopMusic(true)
    } else {
      startMusic(true)
    }
  } else if (buttonPressed?.action === 'sound') {
    window.CTDLGAME.options.sound = !window.CTDLGAME.options.sound
      toggleSounds(window.CTDLGAME.options.sound)
  }
}

function click (e) {
  let canvas = e.target

  if (e.layerX) {
    window.CTDLGAME.cursor = {
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height')
    }
  } else if (e.touches?.length > 0) {
    e.stopPropagation()
    window.BUTTONS = []
    Array.from(e.touches).forEach(touch => {
      window.CTDLGAME.cursor = {
        x: (touch.clientX - e.target.offsetLeft) / canvas.clientWidth * canvas.getAttribute('width'),
        y: (touch.clientY - e.target.offsetTop) / canvas.clientHeight * canvas.getAttribute('height')
      }

      let buttonPressed = constants.BUTTONS.find(button =>
        window.CTDLGAME.cursor.x > button.x &&
        window.CTDLGAME.cursor.x < button.x + button.w &&
        window.CTDLGAME.cursor.y > button.y &&
        window.CTDLGAME.cursor.y < button.y + button.h
      )

      if (buttonPressed) {
        window.BUTTONS.unshift(buttonPressed)
      }
    })
  }
  if (!/ctdl-game/.test(canvas.id)) {
    return
  }

  let click = {
    x: window.CTDLGAME.cursor.x + window.CTDLGAME.viewport.x,
    y: window.CTDLGAME.cursor.y + window.CTDLGAME.viewport.y,
    w: 1, h: 1
  }

  if (window.CTDLGAME.ghostBlock) {
    // TODO refactor into placeBlock method
    playSound('block')
    window.CTDLGAME.ghostBlock.context = constants.gameContext
    window.CTDLGAME.ghostBlock.opacity = 1
    window.CTDLGAME.ghostBlock.isSolid = true
    window.CTDLGAME.inventory.blocks.shift()
    window.CTDLGAME.objects.push(window.CTDLGAME.ghostBlock)
    window.SELECTEDCHARACTER.action()
    window.CTDLGAME.ghostBlock = null
  }

  let object = CTDLGAME.quadTree.query(click).find(obj => contains(obj.getBoundingBox(), click))

  if (object?.class === 'Character') window.SELECTEDCHARACTER.unselect()
  if (window.SELECTED) window.SELECTED.unselect()
  if (!object) return
  object.select()
}

function clickEnd (e) {
  let canvas = e.target
  window.BUTTONS = []
  if (e.layerX) {
    window.CTDLGAME.cursor = {
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height')
    }
  } else if (e.touches?.length > 0) {
    e.stopPropagation()
    Array.from(e.touches).forEach(touch => {
      window.CTDLGAME.cursor = {
        x: (touch.clientX - e.target.offsetLeft) / canvas.clientWidth * canvas.getAttribute('width'),
        y: (touch.clientY - e.target.offsetTop) / canvas.clientHeight * canvas.getAttribute('height')
      }
      let buttonPressed = constants.BUTTONS.find(button =>
        button.active &&
        window.CTDLGAME.cursor.x > button.x &&
        window.CTDLGAME.cursor.x < button.x + button.w &&
        window.CTDLGAME.cursor.y > button.y &&
        window.CTDLGAME.cursor.y < button.y + button.h
      )

      if (buttonPressed) {
        window.BUTTONS.unshift(buttonPressed)
      }
    })
  }
}

function mouseMove (e) {
  let canvas = e.target
  window.CTDLGAME.cursor = {
    x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
    y: e.layerY / canvas.clientHeight * canvas.getAttribute('height')
  }

  if (e.layerX) {
    window.CTDLGAME.cursor = {
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height')
    }
  } else if (e.touches?.length > 0) {
    window.CTDLGAME.cursor = {
      x: (e.touches[0].clientX - e.target.offsetLeft) / canvas.clientWidth * canvas.getAttribute('width'),
      y: (e.touches[0].clientY - e.target.offsetTop) / canvas.clientHeight * canvas.getAttribute('height')
    }
  }

  if (!/ctdl-game/.test(canvas.id)) {
    return
  }

  showOverlay()
}