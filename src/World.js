import constants from './constants'
import { CTDLGAME, getTimeOfDay, loadAsset, showProgressBar } from './gameUtils'
import { easeInOut, intersects } from './geometryUtils'
import { canDrawOn } from './performanceUtils'
import Moon from './Moon'
import Sun from './Sun'
import { darken, drawLightSources } from './mapUtils'

const sun = new Sun({
  x: CTDLGAME.viewport.x + constants.WIDTH / 2,
  y: CTDLGAME.viewport.y + 10
})
const moon = new Moon({
  x: CTDLGAME.viewport.x + constants.WIDTH / 2,
  y: CTDLGAME.viewport.y + 10
})
class World {
  constructor(id, map) {
    this.id = id

    this.map = map
    this.w = this.map.world.w
    this.h = this.map.world.h
    this.tileSize = this.map.world.tileSize || 8
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

    if (this.map.overworld) {
      sun.update()
      moon.update()
    } else if (this.map.bgColor) {
      constants.skyContext.globalAlpha = 1
      constants.skyContext.fillStyle = CTDLGAME.world.map.bgColor()
      constants.skyContext.fillRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
    }
    if (this.map.parallax.length > 0 && canDrawOn('parallaxContext')) {
      let parallaxViewport = {
        x: Math.round(CTDLGAME.viewport.x / 2),
        y: Math.round(CTDLGAME.viewport.y / 4 + CTDLGAME.world.h / 4 * 3 - 144),
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
          constants.parallaxContext.globalAlpha = .2
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
  applyShaders = () => {
    if (this.map.overworld) {
      let timeOfDay = getTimeOfDay()
      let y = timeOfDay < 4 || timeOfDay > 20 ? 1 : 0
      if (timeOfDay >= 4 && timeOfDay <= 6) {
        y = 1 - easeInOut((4 - timeOfDay) / -2, 3)
      } else if (timeOfDay >= 17 && timeOfDay <= 20) {
        y = easeInOut((timeOfDay - 17) / 3, 3)
      }
      if (y > 0) {
        darken(y / 2, y / 2, '#212121')
        drawLightSources(CTDLGAME.lightSources, this.id, this.tileSize, y)
      }
    }
  }
}
export default World