import { contains, touches, intersects, sharpLine } from './geometryUtils';
import Block from './block'
import constants from './constants'

let ghostBlock

export const updateOverlay = () => {
  constants.overlayContext.clearRect(window.CTDLGAME.viewport.x, window.CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)

  if (!window.SELECTED || window.SELECTED.class !== 'Character') return

  if (Math.abs(window.SELECTED.getCenter().x - (window.CTDLGAME.viewport.x + window.CTDLGAME.cursor.x)) > 30) return
  if (Math.abs(window.SELECTED.getCenter().y - (window.CTDLGAME.viewport.y + window.CTDLGAME.cursor.y)) > 30) return

  ghostBlock = new Block(
    'ghost' + Math.random(),
    constants.overlayContext,
    CTDLGAME.quadTree,
    {
      x: Math.round((window.CTDLGAME.viewport.x + window.CTDLGAME.cursor.x) / 3) * 3 - 3,
      y: Math.round((window.CTDLGAME.viewport.y + window.CTDLGAME.cursor.y) / 3) * 3 - 3,
      w: 6, h: 6,
      opacity: .5
    }
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
      Math.round(window.SELECTED.getCenter().x),
      Math.round(window.SELECTED.getCenter().y)
    )
    ghostBlock.update()
  }

  if (intersectingObject || !touchingObject) {
    ghostBlock = null
  }
}

export default () => {
  window.addEventListener('keydown', e => {
    KEYS.push(e.key.toLowerCase());
  })

  window.addEventListener('keyup', e => {
    KEYS = KEYS.filter(key => {
      return key !== e.key.toLowerCase()
    })
  })

  window.addEventListener('mousedown', e => {
    let canvas = e.target

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
      window.CTDLGAME.objects.push(ghostBlock)
      window.SELECTED.action()
      ghostBlock = null
    }

    let object = CTDLGAME.quadTree.query(click).find(obj => contains(obj.getBoundingBox(), click))

    if (!object) return
    window.SELECTED.unselect()
    object.select()
  })

  window.addEventListener('mousemove', e => {
    let canvas = e.target
    window.CTDLGAME.cursor = {
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height')
    }

    if (!/ctdl-game/.test(canvas.id)) {
      return
    }

    updateOverlay()
  })
}