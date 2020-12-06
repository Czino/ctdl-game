import constants from './constants'
import { CTDLGAME, loadAsset, showProgressBar } from './gameUtils'
import { intersects } from './geometryUtils'
import { canDrawOn } from './performanceUtils'

class World {
  constructor(id, map) {
    this.id = id

    this.map = map
    this.w = this.map.world.w
    this.h = this.map.world.h
    CTDLGAME.objects = CTDLGAME.objects.concat(this.map.events)
    CTDLGAME.lightSources = this.map.lightSources
    this.loadAssets()
  }

  loadAssets = async () => {
    let i = 0
    let len = Object.keys(this.map.assets).length

    for (let key in this.map.assets) {
      if (!CTDLGAME.assets[key]) {
        CTDLGAME.assets[key] = await loadAsset(this.map.assets[key])
        constants.overlayContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
      }

      showProgressBar(i / (len - 1))
      i++
    }
    this.ready = true
  }

  update = () => {
    let sprite = CTDLGAME.assets[this.id]

    if (this.map.parallax.length > 0 && canDrawOn('parallaxContext')) {
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
        })
        if (CTDLGAME.skyColor) {
          constants.parallaxContext.globalCompositeOperation = 'source-atop'
          constants.parallaxContext.globalAlpha = .1
          constants.parallaxContext.fillStyle = `hsl(${CTDLGAME.skyColor.h}, ${CTDLGAME.skyColor.s}%, ${CTDLGAME.skyColor.l}%)`
          constants.parallaxContext.fillRect(
            parallaxViewport.x, parallaxViewport.y, constants.WIDTH, constants.HEIGHT
          )
          constants.parallaxContext.globalAlpha = 1
          constants.parallaxContext.globalCompositeOperation = 'source-over'
        }
    }

    if (this.map.bg.length > 0 && canDrawOn('bgContext')) {
      this.map.bg
        .filter(tile => intersects(tile, CTDLGAME.viewport))
        .map(tile => {
          constants.bgContext.drawImage(
            sprite,
            tile.tile[0], tile.tile[1], tile.w, tile.h,
            tile.x, tile.y, tile.w, tile.h
          )
        })
    }

    if (this.map.base && this.map.base.length > 0 && canDrawOn('gameContext')) {
      this.map.base
        .filter(tile => intersects(tile, CTDLGAME.viewport))
        .map(tile => {
          constants.gameContext.drawImage(
            sprite,
            tile.tile[0], tile.tile[1], tile.w, tile.h,
            tile.x, tile.y, tile.w, tile.h
          )
        })
    }

    if (this.map.fg.length > 0 && canDrawOn('fgContext')) {
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
}
export default World