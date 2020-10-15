import * as db from './db'
import { contains } from './geometryUtils'
import constants from './constants'
import { CTDLGAME, loadGame, newGame, saveStateExists, showIntro } from './gameUtils'
import { addTextToQueue, setTextQueue, skipText } from './textUtils'
import { addClass, removeClass } from './htmlUtils'
import { stopMusic, toggleSoundtrack } from './soundtrack'
import { isSoundLoaded, playSound, toggleSounds } from './sounds'
import { start } from 'tone'

window.KEYS = []
window.BUTTONS = []

// TODO refactor into eventUtils
constants.BUTTONS = constants.BUTTONS.concat([
  {
    action: 'initGame',
    x: 0,
    y: 0,
    w: constants.WIDTH,
    h: constants.HEIGHT,
    active: true,
    onclick: async () => {
      await start() // start tone JS

      CTDLGAME.isSoundLoaded = isSoundLoaded()

      if (!CTDLGAME.isSoundLoaded) return

      constants.BUTTONS
        .filter(button => /initGame/.test(button.action))
        .forEach(button => button.active = false)

      constants.BUTTONS
        .filter(button => /newGame/.test(button.action))
        .forEach(button => button.active = true)

      if (!(await saveStateExists())) {
        CTDLGAME.newGame = true
      } else {
        constants.BUTTONS
          .filter(button => /loadGame/.test(button.action))
          .forEach(button => button.active = true)
      }

      initEvents(true)
    }
  },
  {
    action: 'loadGame',
    x: constants.WIDTH / 2 - 41,
    y: constants.HEIGHT / 2 + 20,
    w: 80,
    h: 10,
    active: false,
    onclick: async () => {
      stopMusic()
      playSound('select')

      CTDLGAME.startScreen = false
      await loadGame()

      constants.BUTTONS
        .filter(button => /newGame|loadGame|skipIntro/.test(button.action))
        .forEach(button => button.active = false)

      window.removeEventListener('mousedown', startScreenHandler)
      window.removeEventListener('touchstart', startScreenHandler)
      initEvents(false)
    }
  },
  {
    action: 'newGame',
    x: constants.WIDTH / 2 - 35,
    y: constants.HEIGHT / 2,
    w: 60,
    h: 10,
    active: true,
    onclick: () => {
      playSound('select')

      showIntro()
      CTDLGAME.startScreen = false
      CTDLGAME.cutScene = true

      constants.BUTTONS
        .filter(button => /newGame|loadGame/.test(button.action))
        .forEach(button => button.active = false)

      window.removeEventListener('mousedown', startScreenHandler)
      window.removeEventListener('touchstart', startScreenHandler)
      initEvents(false)
    }
  },
  {
    action: 'skipIntro',
    x: constants.WIDTH / 2 - 9,
    y: constants.HEIGHT - 60,
    w: 60,
    h: 10,
    active: true,
    onclick: () => {
      playSound('select')

      setTextQueue([])
      stopMusic()
      CTDLGAME.cutScene = false
      newGame()

      constants.BUTTONS
        .filter(button => /skipIntro/.test(button.action))
        .forEach(button => button.active = false)
    }
  },
  {
    action: 'music',
    x: constants.WIDTH - 3 - 9 - 11,
    y: 3,
    w: 9,
    h: 9,
    active: true,
    onclick: async () => {
      CTDLGAME.options.music = !CTDLGAME.options.music
      toggleSoundtrack(CTDLGAME.options.music)
      await db.set('options', CTDLGAME.options)
    }
  },
  {
    action: 'sound',
    x: constants.WIDTH - 3 - 9 ,
    y: 3,
    w: 9,
    h: 9,
    active: true,
    onclick: async () => {
      CTDLGAME.options.sound = !CTDLGAME.options.sound
      await db.set('options', CTDLGAME.options)
      toggleSounds(CTDLGAME.options.sound)
    }
  },
  { action: 'jump', x: 21 * 4, y: constants.HEIGHT - 20, w: 18, h: 18, active: false, hasBorder: true},
  { action: 'attack', x: 21 * 5, y: constants.HEIGHT - 20, w: 18, h: 18, active: false, hasBorder: true},
  { action: 'moveLeft', x: 0, y: constants.HEIGHT - 20, w: 18, h: 18, active: false, hasBorder: true},
  { action: 'moveRight', x: 21, y: constants.HEIGHT - 20, w: 18, h: 18, active: false, hasBorder: true},
  { action: 'back', x: 21 * 2, y: constants.HEIGHT - 20, w: 18, h: 18, active: false, hasBorder: true},
  { action: 'switch', x: 21 * 3, y: constants.HEIGHT - 20, w: 18, h: 18, active: false, hasBorder: true, onclick: switchCharacter}
])

export const startScreenHandler = async (e) => {
  let canvas = e.target
  if (!/ctdl-game/.test(canvas.id)) {
    return
  }

  if (e.layerX) {
    CTDLGAME.cursor = {
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height')
    }
    let buttonPressed = constants.BUTTONS.concat(CTDLGAME.eventButtons).find(button =>
      button.active &&
      CTDLGAME.cursor.x > button.x &&
      CTDLGAME.cursor.x < button.x + button.w &&
      CTDLGAME.cursor.y > button.y &&
      CTDLGAME.cursor.y < button.y + button.h
    )
  
    if (buttonPressed?.onclick) buttonPressed.onclick()
  } else if (e.touches?.length > 0) {
    e.stopPropagation()
    CTDLGAME.cursor = {
      x: (e.touches[0].clientX - e.target.offsetLeft) / canvas.clientWidth * canvas.getAttribute('width'),
      y: (e.touches[0].clientY - e.target.offsetTop) / canvas.clientHeight * canvas.getAttribute('height')
    }
    CTDLGAME.touchScreen = true

    constants.BUTTONS
      .filter(button => /moveLeft|moveRight|jump|back|switch|attack/.test(button.action))
      .forEach(button => button.active = true)
  }
}

window.addEventListener('mousemove', mouseMoveHandler)
window.addEventListener('mousedown', startScreenHandler)
window.addEventListener('touchstart', startScreenHandler)

export const initEvents = startScreen => {
  try {
    document.createEvent('TouchEvent')
    CTDLGAME.touchScreen = true
  } catch (e) {
    CTDLGAME.touchScreen = false
  }

  if (startScreen) {
    window.removeEventListener('mousedown', click)
    window.removeEventListener('touchstart', click)
    window.removeEventListener('mouseup', clickEnd)
    window.removeEventListener('touchend', clickEnd)
    window.removeEventListener('mousemove', mouseMove)
    window.removeEventListener('touchmove', mouseMove)
    window.removeEventListener('touchmove', zoomHandler)
    window.addEventListener('resize', resize)
    return
  }

  if (CTDLGAME.touchScreen) {
    window.addEventListener('touchstart', click)
    window.addEventListener('touchend', clickEnd)
    window.addEventListener('touchmove', mouseMove)
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
    if (!CTDLGAME.multiplayer) {
      if (Object.keys(constants.CONTROLS.katoshi).indexOf(e.key.toLowerCase()) !== -1 &&
        CTDLGAME.hodlonaut.inViewport && CTDLGAME.katoshi.inViewport) {
        CTDLGAME.multiplayer = true
        addTextToQueue('Multiplayer activated')
      }
    }
    if (e.key.toLowerCase() === 'tab') {
      e.preventDefault()
      switchCharacter()
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

function resize () {
  constants.canvases.forEach(canvas => {
    canvas.style.height = (Math.round(window.innerHeight / 2) * 2) + 'px'
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
  let buttonHover = constants.BUTTONS.concat(CTDLGAME.eventButtons).find(button =>
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
    })

  }

  if (!/ctdl-game/.test(canvas.id)) return

  let buttonPressed = constants.BUTTONS.find(button =>
    button.active && 
    CTDLGAME.cursor.x > button.x &&
    CTDLGAME.cursor.x < button.x + button.w &&
    CTDLGAME.cursor.y > button.y &&
    CTDLGAME.cursor.y < button.y + button.h
  )

  if (buttonPressed?.onclick) {
    buttonPressed.onclick()
  } else if (buttonPressed) {
    window.BUTTONS.unshift(buttonPressed)
  }

  if (CTDLGAME.cursor.y > 215 && CTDLGAME.cursor.y < 232) skipText()
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

  CTDLGAME.showOverlay = false
  CTDLGAME.zoom = null

  let click = {
    x: CTDLGAME.cursor.x + CTDLGAME.viewport.x,
    y: CTDLGAME.cursor.y + CTDLGAME.viewport.y,
    w: 1, h: 1
  }

  if (!CTDLGAME.quadTree) return

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
  if (window.SELECTED) window.SELECTED.unselect()
  if (!object) return
  if (object.class === 'Character') window.SELECTEDCHARACTER.unselect()
  if (object.select) object.select()
  if (object.class === 'Block') {
    object.toggleSolid()
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

  if (CTDLGAME.showShop) return

  CTDLGAME.showOverlay = true
}

function zoomHandler (e) {
  let canvas = e.target
  if (!/ctdl-game/.test(canvas.id)) {
    return
  }

  CTDLGAME.zoom = {
    x: CTDLGAME.viewport.x + CTDLGAME.cursor.x,
    y: CTDLGAME.viewport.y + CTDLGAME.cursor.y
  }
}

function switchCharacter() {
  if (window.SELECTEDCHARACTER.id === 'hodlonaut') {
    CTDLGAME.katoshi.select()
  } else {
    CTDLGAME.hodlonaut.select()
  }
}