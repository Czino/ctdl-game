import { contains } from './geometryUtils'
import constants from './constants'
import { CTDLGAME, newGame, loadGame, showOverlay } from './gameUtils'
import { addTextToQueue, skipText } from './textUtils'
import { addClass, removeClass } from './htmlUtils'
import { stopMusic, startMusic } from './soundtrack'
import { playSound, toggleSounds } from './sounds'


window.KEYS = []
window.BUTTONS = []

export const initEvents = startScreen => {
  try {
    document.createEvent('TouchEvent')
    CTDLGAME.touchScreen = true
  } catch (e) {
    CTDLGAME.touchScreen = false
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
    if (!CTDLGAME.multiplayer) {
      if (Object.keys(constants.CONTROLS.katoshi).indexOf(e.key.toLowerCase()) !== -1) {
        CTDLGAME.multiplayer = true
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
    CTDLGAME.cursor = {
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height')
    }
  }
  let buttonHover = constants.BUTTONS.find(button =>
    button.active &&
    CTDLGAME.cursor.x > button.x &&
    CTDLGAME.cursor.x < button.x + button.w &&
    CTDLGAME.cursor.y > button.y &&
    CTDLGAME.cursor.y < button.y + button.h
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
    CTDLGAME.cursor = {
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height')
    }
  } else if (e.touches?.length > 0) {
    e.stopPropagation()
    CTDLGAME.cursor = {
      x: (e.touches[0].clientX - e.target.offsetLeft) / canvas.clientWidth * canvas.getAttribute('width'),
      y: (e.touches[0].clientY - e.target.offsetTop) / canvas.clientHeight * canvas.getAttribute('height')
    }
    CTDLGAME.touchScreen = true

    constants.BUTTONS
      .filter(button => /moveLeft|moveRight|jump|back|attack/.test(button.action))
      .forEach(button => button.active = true)
  }
  let buttonPressed = constants.BUTTONS.find(button =>
    button.active &&
    CTDLGAME.cursor.x > button.x &&
    CTDLGAME.cursor.x < button.x + button.w &&
    CTDLGAME.cursor.y > button.y &&
    CTDLGAME.cursor.y < button.y + button.h
  )

  if (buttonPressed?.action === 'newGame') {
    playSound('select')

    newGame()
    CTDLGAME.startScreen = false

    constants.BUTTONS
      .filter(button => /newGame|loadGame/.test(button.action))
      .forEach(button => button.active = false)

    window.removeEventListener('mouseup', startScreenHandler)
    window.removeEventListener('touchend', startScreenHandler)
    initEvents(false)
  } else if (buttonPressed?.action === 'loadGame') {
    playSound('select')

    CTDLGAME.startScreen = false
    await loadGame()

    constants.BUTTONS
      .filter(button => /newGame|loadGame/.test(button.action))
      .forEach(button => button.active = false)

    window.removeEventListener('mouseup', startScreenHandler)
    window.removeEventListener('touchend', startScreenHandler)
    initEvents(false)
  } else if (buttonPressed?.action === 'music') {
    CTDLGAME.options.music = !CTDLGAME.options.music
    if (!CTDLGAME.options.music) {
      stopMusic(true)
    } else {
      startMusic(true)
    }
  } else if (buttonPressed?.action === 'sound') {
    CTDLGAME.options.sound = !CTDLGAME.options.sound
      toggleSounds(CTDLGAME.options.sound)
  }
}

function click (e) {
  let canvas = e.target

  if (e.layerX) {
    CTDLGAME.cursor = {
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height')
    }
  } else if (e.touches?.length > 0) {
    e.stopPropagation()
    window.BUTTONS = []
    Array.from(e.touches).forEach(touch => {
      CTDLGAME.cursor = {
        x: (touch.clientX - e.target.offsetLeft) / canvas.clientWidth * canvas.getAttribute('width'),
        y: (touch.clientY - e.target.offsetTop) / canvas.clientHeight * canvas.getAttribute('height')
      }

      let buttonPressed = constants.BUTTONS.find(button =>
        CTDLGAME.cursor.x > button.x &&
        CTDLGAME.cursor.x < button.x + button.w &&
        CTDLGAME.cursor.y > button.y &&
        CTDLGAME.cursor.y < button.y + button.h
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
    x: CTDLGAME.cursor.x + CTDLGAME.viewport.x,
    y: CTDLGAME.cursor.y + CTDLGAME.viewport.y,
    w: 1, h: 1
  }

  let object = CTDLGAME.quadTree.query(click).find(obj => contains(obj.getBoundingBox(), click))

  if (!object && CTDLGAME.ghostBlock) {
    // TODO refactor into placeBlock method
    playSound('block')
    CTDLGAME.ghostBlock.context = constants.gameContext
    CTDLGAME.ghostBlock.opacity = 1
    CTDLGAME.ghostBlock.isSolid = true
    CTDLGAME.inventory.blocks.shift()
    CTDLGAME.objects.push(CTDLGAME.ghostBlock)
    window.SELECTEDCHARACTER.action()
    CTDLGAME.ghostBlock = null
  }

  if (object?.class === 'Character') window.SELECTEDCHARACTER.unselect()
  if (window.SELECTED) window.SELECTED.unselect()
  if (!object) return
  object.select()
  if (object.class === 'Block') {
    object.toggleSolid()
  }
}

function clickEnd (e) {
  let canvas = e.target
  window.BUTTONS = []
  if (e.layerX) {
    CTDLGAME.cursor = {
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height')
    }
  } else if (e.touches?.length > 0) {
    e.stopPropagation()
    Array.from(e.touches).forEach(touch => {
      CTDLGAME.cursor = {
        x: (touch.clientX - e.target.offsetLeft) / canvas.clientWidth * canvas.getAttribute('width'),
        y: (touch.clientY - e.target.offsetTop) / canvas.clientHeight * canvas.getAttribute('height')
      }
      let buttonPressed = constants.BUTTONS.find(button =>
        button.active &&
        CTDLGAME.cursor.x > button.x &&
        CTDLGAME.cursor.x < button.x + button.w &&
        CTDLGAME.cursor.y > button.y &&
        CTDLGAME.cursor.y < button.y + button.h
      )

      if (buttonPressed) {
        window.BUTTONS.unshift(buttonPressed)
      }
    })
  }
}

function mouseMove (e) {
  let canvas = e.target
  CTDLGAME.cursor = {
    x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
    y: e.layerY / canvas.clientHeight * canvas.getAttribute('height')
  }

  if (e.layerX) {
    CTDLGAME.cursor = {
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height')
    }
  } else if (e.touches?.length > 0) {
    CTDLGAME.cursor = {
      x: (e.touches[0].clientX - e.target.offsetLeft) / canvas.clientWidth * canvas.getAttribute('width'),
      y: (e.touches[0].clientY - e.target.offsetTop) / canvas.clientHeight * canvas.getAttribute('height')
    }
  }

  if (!/ctdl-game/.test(canvas.id)) {
    return
  }

  showOverlay()
}