import { contains, touches, intersects } from './geometryUtils';
import Block from './block'
import constants from './constants'

let ghostBlock

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
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height'),
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

    if (!/ctdl-game/.test(canvas.id)) {
      return
    }

    ghostBlock = new Block(
      'ghost' + Math.random(),
      constants.overlayContext,
      QUADTREE,
      {
        x: Math.round(e.layerX / canvas.clientWidth * canvas.getAttribute('width') / 3) * 3 - 3,
        y: Math.round(e.layerY / canvas.clientHeight * canvas.getAttribute('height') / 3) * 3 - 3,
        w: 6, h: 6,
        opacity: .5
      }
    )

    await ghostBlock.load()
    constants.overlayContext.clearRect(0, 0, constants.WIDTH, constants.HEIGHT)

    let touchingObject = QUADTREE.query(ghostBlock).find(obj =>
        touches(ghostBlock, obj.getBoundingBox())
        && obj.class !== 'Character'
    )
    if (!touchingObject) return
    let intersectingObject = QUADTREE.query(ghostBlock).find(obj =>
        intersects(ghostBlock, obj.getBoundingBox())
        && obj.class !== 'Character'
    )

    if (intersectingObject) {
      ghostBlock = null
      return null
    }
    ghostBlock.update()
  })
}