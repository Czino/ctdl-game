import stage from './stage/mempool'

import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import NPC from '../../npcs/NPC'
import { CTDLGAME, getTimeOfDay } from '../../gameUtils'
import Item from '../../Item'
import darken from '../darken'
import drawLightSources from '../drawLightSources'
import parseLightSources from '../parseLightSources'
import getHitBoxes from '../getHitBoxes'

import mempool from '../../sprites/mempool.png'
import { checkMempool } from '../../gameUtils/checkBlocks'
import constants from '../../constants'
import { random } from '../../arrayUtils'
import { addTextToQueue } from '../../textUtils'
import { playSound } from '../../sounds'

const worldWidth = 76
const worldHeight = 45
const tileSize = 8
const CHECKMEMPOOLTIME = Math.pow(2, 12) // check every X frame
const mempoolSize = 100000000
const poolTop = 29 * tileSize
const maxPoolHeight = 8 * tileSize + 4

stage.parallax = parsePattern(stage.parallax, 0, 0)
stage.bg = parsePattern(stage.bg, 0, 0)
stage.base = parsePattern(stage.base, 0, 0)
stage.fg = parsePattern(stage.fg, 0, 0)
const ramps = [
  [0, 1], [1, 1], [2, 1], [3, 1], [7, 1],
  [0, 2], [1, 2],
  [0, 3], [1, 3],
  [1, 5], [2, 5]
].map(tile => tile.toString())
const solids = [
  [1, 0],
  [0, 6], [1, 6], [2, 6], [3, 6],
  [0, 7], [1, 7], [2, 7], [3, 7],
  [0, 8], [1, 8], [2, 8], [3, 8],
  [0, 9], [1, 9], [2, 9], [3, 9],
  [0, 10], [1, 10], [2, 10], [3, 10],
].map(tile => tile.toString())
const spawnPoints = [].map(tile => tile.toString())
const lights = {
  '4_2': {
    color: '#ddbe24',
    brightness: .2
  },
  '5_2': {
    color: '#ddbe24',
    brightness: .2
  },
  '6_2': {
    color: '#ddbe24',
    brightness: .2
  },
  '4_3': {
    color: '#ddbe24',
    brightness: .2
  },
  '5_3': {
    color: '#ddbe24',
    brightness: .2
  },
  '7_2': {
    color: '#e46622',
    brightness: .3
  },
  '8_2': {
    color: '#e46622',
    brightness: .3
  },
  '6_3': {
    color: '#e46622',
    brightness: .1
  },
  '6_4': {
    color: '#e46622',
    brightness: .5,
    radius: 64
  },
}

let lightSources = parseLightSources(lights, stage.bg, tileSize)
  .concat(parseLightSources(lights, stage.base, tileSize))
  .concat(parseLightSources(lights, stage.fg, tileSize))

let events = []
let objects = []

objects = objects.concat(getHitBoxes(stage.base, ramps, solids, spawnPoints, 'mempool', tileSize))

objects.find(obj => obj.id === 'ramp-1_3-63_27').makeToggle(false)

const goToRabbitHole = new GameObject('goToRabbitHole', {
  x: 76 * tileSize,
  y: 26 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

goToRabbitHole.touchEvent = () => {
  changeMap('rabbitHole', 'mempool')
}
events.push(goToRabbitHole)


const treasure = new GameObject('treasure', {
  x: 16 * tileSize,
  y: 36 * tileSize,
  w: tileSize,
  h: 1 * tileSize,
})

treasure.select = () => {
  if (!CTDLGAME.world.map.state.hasCollectedTreasure && CTDLGAME.mempool.vsize < mempoolSize * .3) {
    playSound('block')
    playSound('clunk')
    playSound('honeyBadger')
    CTDLGAME.world.map.state.hasCollectedTreasure = true
    CTDLGAME.objects.push(new Item(
      'honeybadger',
      {
        x: 16 * tileSize,
        y: 36 * tileSize,
        vy: -8,
        vx: Math.round((Math.random() - .5) * 3)
      }
    ))
  }
}

const saltLamp = new GameObject('saltLamp', {
  x: 43 * tileSize,
  y: 20 * tileSize,
  w: tileSize,
  h: 2 * tileSize,
})

events.push(treasure)


saltLamp.select = () => {
  if (saltLamp.selected) return
  const thingsToSay = [
    [
      'Salt Lamp:\nThere is intrinsic value in\nbeing salty.'
    ],
    [
      'Salt Lamp:\nI knew of Bitcoin since 2010.\nI never bought any.'
    ]
  ]

  saltLamp.isSelected = true

  let whatToSay = random(thingsToSay)
  whatToSay.map((text, index) => {
    if (index === whatToSay.length - 1) {
      addTextToQueue(text, () => {
        saltLamp.isSelected = false
      })
    } else {
      addTextToQueue(text)
    }
  })
}
events.push(saltLamp)

let timeOfDay
const bucket = new GameObject('bucket', {
  id: 'bucket',
  x: 41 * tileSize,
  y: 85 * tileSize,
  w: tileSize,
  h: 2 * tileSize
})
bucket.backEvent = () => {
  if (timeOfDay > 18 && timeOfDay < 22 || timeOfDay > 5 && timeOfDay < 9) return

  CTDLGAME.hodlonaut.y = 0
  CTDLGAME.hodlonaut.applyGravity = true
  CTDLGAME.hodlonaut.swims = false
  CTDLGAME.katoshi.y = 0
  CTDLGAME.katoshi.applyGravity = true
  CTDLGAME.katoshi.swims = false
  changeMap('city', 'mempool')
}
events.push(bucket)


const updateBucket = () => {
  timeOfDay = getTimeOfDay()
  let bucketOffset = 0
  if (timeOfDay > 18 && timeOfDay < 20) {
    bucketOffset = Math.round((timeOfDay - 18) * 30 * tileSize)
  } else if (timeOfDay > 20 && timeOfDay < 22) {
    bucketOffset = Math.round((22 - timeOfDay) * 30 * tileSize)
  }

  if (timeOfDay > 5 && timeOfDay < 7) {
    bucketOffset = Math.round((timeOfDay - 5) * 30 * tileSize)
  } else if (timeOfDay > 7 && timeOfDay < 9) {
    bucketOffset = Math.round((9 - timeOfDay) * 30 * tileSize)
  }

  constants.fgContext.drawImage(
    CTDLGAME.assets.mempool,
    64, 72, bucket.w, bucket.h,
    bucket.x, Math.min(bucket.y - bucket.h, 37*tileSize) - bucketOffset, bucket.w, bucket.h
  )
  for (let i = 0; i < bucket.y - bucket.h; i+=8) {
    constants.fgContext.drawImage(
      CTDLGAME.assets.mempool,
      64, 64, tileSize, tileSize,
      bucket.x, i - bucketOffset, tileSize, tileSize
    )
  }
}

const mempoolCallback = () => {
  bucket.y = Math.round(poolTop + (1 - CTDLGAME.mempool.vsize / mempoolSize) * (maxPoolHeight - 3 * tileSize))
}

export default {
  world: { w: worldWidth * tileSize, h: worldHeight * tileSize },
  start: {
    rabbitHole: { x: 72 * tileSize, y: 26 * tileSize - 4 }
  },
  state: {
    hasCollectedTreasure: false
  },
  parallax: stage.parallax.map(tile => mapTile(tile, tileSize)),
  bg: stage.bg.map(tile => mapTile(tile, tileSize)),
  base: stage.base.map(tile => mapTile(tile, tileSize)),
  fg: stage.fg.map(tile => mapTile(tile, tileSize)),
  removeEnemy: stage.base
    .filter(tile => tile.tile.toString() === '1,0')
    .map(tile => mapTile(tile, tileSize)),
  lightSources,
  objects,
  npcs: () => [
  ],
  items: () => [],
  events,
  assets: {
    mempool
  },
  track: () => 'mempool',
  bgColor: () => '#250d07',
  init: () => {
    checkMempool(mempoolCallback)
  },
  update: () => {
    if (CTDLGAME.frame !== 0 && CTDLGAME.frame % CHECKMEMPOOLTIME === 0) checkMempool(mempoolCallback)

    let poolHeight = 0
    if (CTDLGAME.mempool) {
      constants.fgContext.globalCompositeOperation = 'destination-over'
      Object.keys(CTDLGAME.mempool.fee_histogram)
        .sort((a, b) => parseInt(a) > parseInt(b) ? 1 : -1)
        .map(feeBucket => {
          let currentBucket = CTDLGAME.mempool.fee_histogram[feeBucket]
          let height = Math.min(maxPoolHeight, Math.ceil(currentBucket.size / mempoolSize * maxPoolHeight))
          poolHeight = Math.min(maxPoolHeight, poolHeight + height)

          constants.fgContext.fillStyle = currentBucket.color
          constants.fgContext.fillRect(1 * tileSize, poolTop + maxPoolHeight - poolHeight, 58 * tileSize, height)
        })

      updateBucket()

      ;['hodlonaut', 'katoshi'].map(char => {
        if (CTDLGAME[char].y + 11 > poolTop + maxPoolHeight - poolHeight) {
          CTDLGAME[char].y-=2
          if (CTDLGAME[char].vy > 2) CTDLGAME[char].vy = 0
          CTDLGAME[char].applyGravity = false
          CTDLGAME[char].swims = true
        } else {
          CTDLGAME[char].applyGravity = true
          CTDLGAME[char].swims = false
        }
      })
    }

    darken(.4, .3, '#250d07')
    drawLightSources(lightSources, 'mempool', tileSize)
  },
  spawnRates: {
    rabbit: 0.025
  }
}
