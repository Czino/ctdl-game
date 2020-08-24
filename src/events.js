import { contains, touches, intersects, sharpLine } from './geometryUtils';
import Block from './block'
import constants from './constants'

let ghostBlock

export const updateOverlay = async () => {
  if (!window.SELECTED || window.SELECTED.class !== 'Character') return

  if (Math.abs(window.SELECTED.getCenter().x - window.CTDLGAME.cursor.x) > 30) return
  if (Math.abs(window.SELECTED.getCenter().y - window.CTDLGAME.cursor.y) > 30) return

  ghostBlock = new Block(
    'ghost' + Math.random(),
    constants.overlayContext,
    QUADTREE,
    {
      x: Math.round(window.CTDLGAME.cursor.x / 3) * 3 - 3,
      y: Math.round(window.CTDLGAME.cursor.y / 3) * 3 - 3,
      w: 6, h: 6,
      opacity: .5
    }
  )

  await ghostBlock.load()

  let touchingObject = QUADTREE.query(ghostBlock).find(obj =>
      touches(ghostBlock, obj.getBoundingBox())
      && obj.class !== 'Character'
  )
  if (!touchingObject) ghostBlock.status = 'bad'

  let intersectingObject = QUADTREE.query(ghostBlock).find(obj =>
      intersects(ghostBlock, obj.getBoundingBox())
      && obj.class !== 'Character'
  )

  if (!intersectingObject) {
    constants.overlayContext.fillStyle = '#FFF'
    sharpLine(
      constants.overlayContext,
      ghostBlock.getCenter().x, ghostBlock.getCenter().y,
      window.SELECTED.getCenter().x, window.SELECTED.getCenter().y
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
      ...window.CTDLGAME.cursor,
      w: 1, h: 1
    }

    if (ghostBlock) {
      ghostBlock.context = constants.gameContext
      ghostBlock.opacity = 1
      ghostBlock.isSolid = true
      window.CTDLGAME.objects.push(ghostBlock)
      ghostBlock = null
    }

    let object = QUADTREE.query(click).find(obj => contains(obj.getBoundingBox(), click))

    if (!object) return
    window.SELECTED.unselect()
    object.select()
  })

  window.addEventListener('mousemove', async e => {
    let canvas = e.target
    window.CTDLGAME.cursor = {
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height')
    }

    constants.overlayContext.clearRect(0, 0, constants.WIDTH, constants.HEIGHT)

    if (!/ctdl-game/.test(canvas.id)) {
      return
    }

    await updateOverlay()
  })
}