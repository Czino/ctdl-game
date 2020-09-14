import { contains, touches, intersects, sharpLine } from './geometryUtils'
import Block from './block'
import constants from './constants'
import { newGame, loadGame, addTextToQueue, skipText } from './gameUtils'
import { addClass, removeClass } from './htmlUtils'

let ghostBlock

window.KEYS = []
window.BUTTONS = []

export const updateOverlay = () => {
  constants.overlayContext.clearRect(window.CTDLGAME.viewport.x, window.CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)

  if (Math.abs(window.SELECTEDCHARACTER.getCenter().x - (window.CTDLGAME.viewport.x + window.CTDLGAME.cursor.x)) > 30) return
  if (Math.abs(window.SELECTEDCHARACTER.getCenter().y - (window.CTDLGAME.viewport.y + window.CTDLGAME.cursor.y)) > 30) return

  if (window.CTDLGAME.inventory.blocks.length > 0) {
    let block = window.CTDLGAME.inventory.blocks[0]
    ghostBlock = new Block(
      block.id,
      constants.overlayContext,
      CTDLGAME.quadTree,
      {
        x: Math.round((window.CTDLGAME.viewport.x + window.CTDLGAME.cursor.x) / 3) * 3 - 3,
        y: Math.round((window.CTDLGAME.viewport.y + window.CTDLGAME.cursor.y) / 3) * 3 - 3,
        w: 6, h: 6,
        opacity: .5,
        info: { height: block.height }
      },
      block
    )
    let touchingObject = CTDLGAME.quadTree.query(ghostBlock).find(obj =>
        touches(ghostBlock, obj.getBoundingBox())
        && obj.class !== 'Character'
    )
    if (!touchingObject) ghostBlock.status = 'bad'

    let intersectingObject = CTDLGAME.quadTree.query(ghostBlock).find(obj => intersects(ghostBlock, obj.getBoundingBox()))

    if (!intersectingObject) {
      constants.overlayContext.fillStyle = '#FFF'
      sharpLine(
        constants.overlayContext,
        Math.round(ghostBlock.getCenter().x),
        Math.round(ghostBlock.getCenter().y),
        Math.round(window.SELECTEDCHARACTER.getCenter().x),
        Math.round(window.SELECTEDCHARACTER.getCenter().y)
      )
      ghostBlock.update()
    }

    if (intersectingObject || !touchingObject) {
      ghostBlock = null
    }

  }
}

export const initEvents = startScreen => {
  if (startScreen) {
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

  function mouseMoveHandler (e) {
    let canvas = e.target

    window.CTDLGAME.touchScreen = false

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
      newGame()
      window.CTDLGAME.startScreen = false

      constants.BUTTONS
        .filter(button => /newGame|loadGame/.test(button.action))
        .forEach(button => button.active = false)

      window.removeEventListener('mouseup', startScreenHandler)
      window.removeEventListener('touchend', startScreenHandler)
      initEvents(false)
    } else if (buttonPressed?.action === 'loadGame') {
      window.CTDLGAME.startScreen = false
      await loadGame()

      constants.BUTTONS
        .filter(button => /newGame|loadGame/.test(button.action))
        .forEach(button => button.active = false)

      window.removeEventListener('mouseup', startScreenHandler)
      window.removeEventListener('touchend', startScreenHandler)
      initEvents(false)
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

    if (ghostBlock) {
      ghostBlock.context = constants.gameContext
      ghostBlock.opacity = 1
      ghostBlock.isSolid = true
      window.CTDLGAME.inventory.blocks.shift()
      window.CTDLGAME.objects.push(ghostBlock)
      window.SELECTEDCHARACTER.action()
      ghostBlock = null
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

    updateOverlay()
  }
}