import stage from './stage/mempool'

import { addHook, CTDLGAME, getTimeOfDay } from '../../gameUtils'
import { changeMap } from '../changeMap'
import { mapTile } from '../mapTile'
import { parsePattern } from '../parsePattern'
import GameObject from '../../GameObject'
import Item from '../../Item'
import Human from '../../npcs/Human'
import darken from '../darken'
import drawLightSources from '../drawLightSources'
import parseLightSources from '../parseLightSources'
import getHitBoxes from '../getHitBoxes'
import { checkMempool } from '../../gameUtils/checkBlocks'
import constants from '../../constants'
import { random } from '../../arrayUtils'
import { addTextToQueue } from '../../textUtils'
import { playSound } from '../../sounds'
import { intersects } from '../../geometryUtils'
import Des from '../../npcs/Des'
import Soulexporter from '../../npcs/Soulexporter'
import SoulexBoy from '../../npcs/SoulexBoy'

import mempool from '../../sprites/mempool.png'
import citizen1 from '../../sprites/citizen-1.png'
import everitt from '../../sprites/everitt.png'
import des from '../../sprites/des.png'
import soulexporter from '../../sprites/soulexporter.png'
import soulexBoy from '../../sprites/soulexBoy.png'

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


const jumpIntoThePool = new GameObject('jumpIntoThePool', {
  x: 26 * tileSize,
  y: 20 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})

jumpIntoThePool.jumpEvent = char => {
  if (CTDLGAME.mempool.vsize < 40000000) return
  char.context = 'fgContext'
  addHook(CTDLGAME.frame + 80, () => {
    playSound('splash')
    // TODO add visual splash effect
    char.context = 'charContext'
  })
}
events.push(jumpIntoThePool)

const npcBarrier = new GameObject('npcBarrier', {
  x: 65 * tileSize,
  y: 20 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})
events.push(npcBarrier)

const npcBarrier2 = new GameObject('npcBarrier2', {
  x: 54 * tileSize,
  y: 26 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})
events.push(npcBarrier2)

const npcBarrier3 = new GameObject('npcBarrier3', {
  x: 33 * tileSize,
  y: 28 * tileSize,
  w: tileSize,
  h: 3 * tileSize,
})
events.push(npcBarrier3)


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
    bucket.x, Math.min(bucket.y - bucket.h, 37 * tileSize) - bucketOffset, bucket.w, bucket.h
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
  bucket.y = Math.round(poolTop + (1 - Math.min(CTDLGAME.mempool.vsize, mempoolSize) / mempoolSize) * (maxPoolHeight - 3 * tileSize))
  if (CTDLGAME.mempool.vsize > mempoolSize / 10) bucket.y += 2
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
    new Human(
      'everitt',
      {
        spriteId: 'everitt',
        x: 43 * tileSize,
        y: 18 * tileSize - 4,
        walkingSpeed: 2,
        business: 0.03
      }
    ),
    new Des(
      'des',
      {
        x: 18 * tileSize,
        y: 24 * tileSize - 2
      }
    ),
    new Soulexporter(
      'soulexporter',
      {
        x: 38 * tileSize -2,
        y: 18 * tileSize -2,
        context: 'fgContext'
      }
    ),
    new SoulexBoy(
      'soulexBoy',
      {
        x: 59 * tileSize,
        y: 26 * tileSize - 2,
        direction: 'right'
      }
    ),
    new Human(
      'tbd-1',
      {
        spriteId: 'citizen1',
        x: 43 * tileSize,
        y: 18 * tileSize - 4,
        walkingSpeed: 2,
        business: 0.04
      }
    ),
    new Human(
      'tbd-2',
      {
        spriteId: 'citizen1',
        x: 43 * tileSize,
        y: 18 * tileSize - 4,
        walkingSpeed: 2,
        business: 0.04
      }
    ),
    new Human(
      'tbd-3',
      {
        spriteId: 'citizen1',
        x: 43 * tileSize,
        y: 27 * tileSize,
        walkingSpeed: 1,
        business: 0.3
      }
    )
  ],
  items: () => [],
  events,
  assets: {
    mempool,
    everitt,
    des,
    soulexporter,
    soulexBoy,
    citizen1
  },
  track: () => 'mempool',
  bgColor: () => '#250d07',
  init: () => {
    const everitt = CTDLGAME.objects.find(obj => obj.id === 'everitt')
    const tbd1 = CTDLGAME.objects.find(obj => obj.id === 'tbd-1')
    const tbd2 = CTDLGAME.objects.find(obj => obj.id === 'tbd-2')
    const tbd3 = CTDLGAME.objects.find(obj => obj.id === 'tbd-3')
    if (!tbd1) return

    everitt.thingsToSay = [
      ['Jack THNDR:\nI know at least 100,000\npeople who are interested in the Lightning Network.'],
      [
        'Jack THNDR:\nOne of my no-coiner friends asked me to let him know if bitcoin',
        'Jack THNDR:\ngoes back to 5k so he can\nbuy. How do I break it\nto him?'
      ]
    ]
    tbd3.thingsToSay = [
      [
        'tbd3:\nPeople say that there is a\ntreasure hidden in the\nmempool.',
        'tbd3:\nI am trying to find it.'
      ],
      ['tbd3:\nEach drop in this pool\nrepresents a byte waiting\nto be confirmed.'],
      [
        'tbd3:\nDid you know?, there is no\n"the mempool". Each node\nhas their own mempool.',
        'tbd3:\nWhat you see here is just\na metaphor.'
      ]
    ]

    tbd1.select = () => {
      if (tbd1.isTouched) return
      let recommendation
      if (CTDLGAME.recommendedFees) {
        recommendation = Math.random() < .5
          ? `I recommend ${CTDLGAME.recommendedFees.fastestFee} sats/vB, if\nyou want your tx to go\nthrough quickly.`
          : `Use ${CTDLGAME.recommendedFees.hourFee} sats/vB or less for\nlow priority transactions.`
      } else {
        recommendation = 'I like to watch the mempool.'
      }
      tbd1.isTouched = true

      addTextToQueue('tbd1:\n' + recommendation, () => {
        tbd1.isTouched = false
      })
    }

    tbd2.select = () => {
      if (tbd2.isTouched) return
      let recommendation
      if (CTDLGAME.mempool) {
        recommendation = Math.random() < .5
          ? `There are ${CTDLGAME.mempool.count} tx\nsitting in the mempool.`
          : `The mempool is\n${Math.round(CTDLGAME.mempool.vsize / 1024)} MvB big.`
      } else {
        recommendation = 'I like to watch the mempool.'
      }
      tbd2.isTouched = true

      addTextToQueue('tbd2:\n' + recommendation, () => {
        tbd2.isTouched = false
      })
    }

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


      // prevent NPCs from falling down and collecting in the pool
      CTDLGAME.objects
        .filter(obj => /Human/.test(obj.getClass()))
        .filter(npc => intersects(npc, npcBarrier) || intersects(npc, npcBarrier2) || intersects(npc, npcBarrier3))
        .map(npc => npc.goal = null)

      CTDLGAME.objects.filter(obj => /Character|Human|SoulexBoy/.test(obj.getClass()))
        .map(char => {
          if (char.y + 11 > poolTop + maxPoolHeight - poolHeight) {
            char.y -= 2
            if (char.vy > 2) char.vy = 0
            char.applyGravity = false
            char.swims = true
          } else {
            char.applyGravity = true
            char.swims = false
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
