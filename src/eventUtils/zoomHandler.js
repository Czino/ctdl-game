import { CTDLGAME } from '../gameUtils'

export const zoomHandler = e => {
  let canvas = e.target
  if (!/ctdl-game/.test(canvas.id)) {
    return
  }

  CTDLGAME.showOverlay = true

  CTDLGAME.zoom = {
    x: CTDLGAME.viewport.x + CTDLGAME.cursor.x,
    y: CTDLGAME.viewport.y + CTDLGAME.cursor.y
  }
}