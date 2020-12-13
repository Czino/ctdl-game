import constants from '../constants'
import { makeBoundary } from '../geometryUtils'
import Ramp from '../Ramp'

/**
 * @description Method to get hit boxes from map
 * @param {Object[]} layer map layer object
 * @param {Object[]} ramps array of tiles that act as ramps
 * @param {Object[]} solids array of tiles that are solid
 * @param {String} sprite sprite to use for ramps
 * @param {Number} tileSize size of tiles
 */
export const getHitBoxes = (layer, ramps, solids, spawnPoints, sprite, tileSize) => layer
  .map(tile => {
    if (ramps.indexOf(tile.tile.toString()) !== -1) {
      return new Ramp(
        `ramp-${tile.tile.join('_')}-${tile.x}_${tile.y}`,
        constants.bgContext, {
          x: tile.x * tileSize,
          y: tile.y * tileSize + 3,
          w: tileSize,
          h: tileSize,
          sprite,
          spriteData: {
            x: tile.tile[0] * tileSize,
            y: tile.tile[1] * tileSize,
            w: tileSize,
            h: tileSize
          },
          direction: 'right',
          isSolid: true,
          spawnPoint: spawnPoints.indexOf(tile.tile.toString()) !== -1
        }
      )
    } else if (solids.indexOf(tile.tile.toString()) !== -1) {
      return makeBoundary({
        x: tile.x * tileSize,
        y: tile.y * tileSize + 3,
        w: tileSize,
        h: tileSize,
        spawnPoint: spawnPoints.indexOf(tile.tile.toString()) !== -1
      })
    }
  })
  .filter(hitBox => hitBox)

export default getHitBoxes