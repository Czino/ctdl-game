import constants from '../constants'
import Block from '../block'
import { touches, intersects, sharpLine } from '../geometryUtils'

export const showOverlay = () => {
  constants.overlayContext.clearRect(window.CTDLGAME.viewport.x, window.CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)

  if (Math.abs(window.SELECTEDCHARACTER.getCenter().x - (window.CTDLGAME.viewport.x + window.CTDLGAME.cursor.x)) > 30) return
  if (Math.abs(window.SELECTEDCHARACTER.getCenter().y - (window.CTDLGAME.viewport.y + window.CTDLGAME.cursor.y)) > 30) return

  if (window.CTDLGAME.inventory.blocks.length > 0) {
    let block = window.CTDLGAME.inventory.blocks[0]
    window.CTDLGAME.ghostBlock = new Block(
      block.id,
      constants.overlayContext,
      window.CTDLGAME.quadTree, {
        x: Math.round((window.CTDLGAME.viewport.x + window.CTDLGAME.cursor.x) / 3) * 3 - 3,
        y: Math.round((window.CTDLGAME.viewport.y + window.CTDLGAME.cursor.y) / 3) * 3 - 3,
        w: 6,
        h: 6,
        opacity: .5,
        info: {
          height: block.height
        }
      },
      block
    )
    let touchingObject = window.CTDLGAME.quadTree.query(window.CTDLGAME.ghostBlock).find(obj =>
      touches(window.CTDLGAME.ghostBlock, obj.getBoundingBox()) &&
      obj.class !== 'Character'
    )
    if (!touchingObject) window.CTDLGAME.ghostBlock.status = 'bad'

    let intersectingObject = window.CTDLGAME.quadTree.query(window.CTDLGAME.ghostBlock).find(obj => intersects(window.CTDLGAME.ghostBlock, obj.getBoundingBox()))

    if (!intersectingObject) {
      constants.overlayContext.fillStyle = '#FFF'
      sharpLine(
        constants.overlayContext,
        Math.round(window.CTDLGAME.ghostBlock.getCenter().x),
        Math.round(window.CTDLGAME.ghostBlock.getCenter().y),
        Math.round(window.SELECTEDCHARACTER.getCenter().x),
        Math.round(window.SELECTEDCHARACTER.getCenter().y)
      )
      window.CTDLGAME.ghostBlock.update()
    }

    if (intersectingObject || !touchingObject) {
      window.CTDLGAME.ghostBlock = null
    }

  }
}