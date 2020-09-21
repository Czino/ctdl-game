import constants from './constants'
import { CTDLGAME } from './gameUtils'

export default function (id, map) {
  this.id = id
  this.map = map

  CTDLGAME.objects = CTDLGAME.objects.concat(this.map.events)
  this.update = () => {
    let sprite = CTDLGAME.assets[this.id]
    this.map.parallax.map(tile => {
      constants.parallaxContext.drawImage(
        sprite,
        tile.tile[0], tile.tile[1], tile.w, tile.h,
        tile.x, tile.y, tile.w, tile.h
      )
    })
    this.map.bg.map(tile => {
      constants.bgContext.drawImage(
        sprite,
        tile.tile[0], tile.tile[1], tile.w, tile.h,
        tile.x, tile.y, tile.w, tile.h
      )
    })
    this.map.fg.map(tile => {
      constants.fgContext.drawImage(
        sprite,
        tile.tile[0], tile.tile[1], tile.w, tile.h,
        tile.x, tile.y, tile.w, tile.h
      )
    })
  }
}