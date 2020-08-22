import { contains } from "./geometryUtils";

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

    let object = QUADTREE.query(click).find(obj => contains(obj, click))

    if (!object) return
    window.SELECTED.unselect()
    object.select()
  })
}