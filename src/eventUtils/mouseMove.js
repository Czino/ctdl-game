import { CTDLGAME } from '../gameUtils'

export const mouseMove = e => {
  let canvas = e.target

  if (e.layerX) {
    CTDLGAME.cursor = {
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height'),
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