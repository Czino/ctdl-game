import constants from './constants'
import { CTDLGAME } from './gameUtils'
import { intersects } from './geometryUtils'
import { loadMap } from './mapUtils'

export default function (id) {
  this.id = id
  this.map = loadMap(id)
  this.w = this.map.world.w
  this.h = this.map.world.h

  CTDLGAME.objects = CTDLGAME.objects.concat(this.map.events)
  CTDLGAME.lightSources = this.map.lightSources
  this.update = () => {
    let sprite = CTDLGAME.assets[this.id]
    let parallaxViewport = {
      x: CTDLGAME.viewport.x / 2,
      y: CTDLGAME.viewport.y,
      w: CTDLGAME.viewport.w,
      h: CTDLGAME.viewport.h
    }

    this.map.parallax
      .filter(tile => intersects(tile, parallaxViewport))
      .map(tile => {
        constants.parallaxContext.drawImage(
          sprite,
          tile.tile[0], tile.tile[1], tile.w, tile.h,
          tile.x, tile.y, tile.w, tile.h
        )
        constants.parallaxContext.globalCompositeOperation = 'multiply'
        constants.parallaxContext.globalAlpha = .3
        constants.parallaxContext.drawImage(
          sprite,
          tile.tile[0], tile.tile[1], tile.w, tile.h,
          tile.x, tile.y, tile.w, tile.h
          )
        constants.parallaxContext.globalAlpha = 1
        constants.parallaxContext.globalCompositeOperation = 'source-over'
      })

    this.map.bg
      .filter(tile => intersects(tile, CTDLGAME.viewport))
      .map(tile => {
        constants.bgContext.drawImage(
          sprite,
          tile.tile[0], tile.tile[1], tile.w, tile.h,
          tile.x, tile.y, tile.w, tile.h
        )
      })
    this.map.fg
      .filter(tile => intersects(tile, CTDLGAME.viewport))
      .map(tile => {
        constants.fgContext.drawImage(
          sprite,
          tile.tile[0], tile.tile[1], tile.w, tile.h,
          tile.x, tile.y, tile.w, tile.h
        )
      })
  }
}