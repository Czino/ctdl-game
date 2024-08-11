import Character from '../Character'
import Moon from '../Moon'
import QuadTree, { Boundary } from '../Quadtree'
import constants from '../constants'
import Agustin from '../enemies/Agustin'
import BabyLizard from '../enemies/BabyLizard'
import Bagholder from '../enemies/Bagholder'
import BankRobot from '../enemies/BankRobot'
import Bear from '../enemies/Bear'
import BearWhale from '../enemies/BearWhale'
import Blockchain from '../enemies/Blockchain'
import Brian from '../enemies/Brian'
import Craig from '../enemies/Craig'
import Ivan from '../enemies/Ivan'
import Lagarde from '../enemies/Lagarde'
import PoliceForce from '../enemies/PoliceForce'
import Rabbit from '../enemies/Rabbit'
import Shitcoiner from '../enemies/Shitcoiner'
import { newGameButton } from '../eventUtils'
import { write } from '../font'
import { darken } from '../mapUtils'
import AmericanHodl from '../npcs/AmericanHodl'
import BitcoinPoet from '../npcs/BitcoinPoet'
import Bitdov from '../npcs/Bitdov'
import BlueMoon from '../npcs/BlueMoon'
import Chappie from '../npcs/Chappie'
import ChrisWhodl from '../npcs/ChrisWhodl'
import Citizen from '../npcs/Citizen'
import Doge from '../npcs/Doge'
import GlennHodl from '../npcs/GlennHodl'
import HODLvirus from '../npcs/HODLvirus'
import JoseSBam from '../npcs/JoseSBam'
import NPC from '../npcs/NPC'
import NakadaiMonarch from '../npcs/NakadaiMonarch'
import PMullr from '../npcs/PMullr'
import SnakeBitken from '../npcs/SnakeBitken'
import Vlad from '../npcs/Vlad'
import Wiz from '../npcs/Wiz'
import Bull from '../objects/Bull'
import Car from '../objects/Car'
import Ferry from '../objects/Ferry'
import { canDrawOn } from '../performanceUtils'
import { CTDLGAME } from './CTDLGAME'

const velocity = 4
let logoOffsetTop = -100
let logoOffsetBottom = 180
let musicStart = 180

const $body = document.getElementById('body')
const shock = (x = 0, y = 1) => {
  $body.style.left = x + 'vh'
  $body.style.top = y + 'vh'
  setTimeout(() => {
    $body.style.left = '0'
    $body.style.top = '0'
  })
}

export const soundtrack = {
  mariamMatremVirginem: 'Title Theme\n\nLlibre Vermell -\nMariam Matrem\nVirginem\n(Czino 8-bit cover)',
  // shaded: 'Old Building',
  // imperayritzDeLaCiutatIoyosa: 'Village Theme\n\nLlibre Vermell -\nImperayritz De La\nCiutat Ioyosa\n(Czino 8-bit cover)',
  // briansTheme: 'Brian\'s Theme',
  // santaMaria: 'Forest\n\nLlibre Vermell -\nSanta Maria\n(Czino 8-bit cover)',
  // darkIsBetter: 'Vlad Costea -\nDarker is Better\n\n(Czino 8-bit cover)',
  // mempool: 'Mempool',
  // endOfTheRabbitHole: 'End Of The Rabbit Hole\n\nRotamola -\nBack 2 Bassiks\n(Czino 8-bit cover)',
  // ivansTheme: 'Ivan\'s Theme\n(Always Respect\nthe Pamp)',
  // bear: 'Bear\'s Theme',
  // bossTheme: 'Boss Theme',
  // aNewHope: 'Grasslands',
  // stellaSplendence: 'Mt. Gox\n\nLLibre Vermell -\nStella Splendence\n(Czino 8-bit cover)',
  // ageispolis: 'Aphex Twin - Ageispolis\n(Czino 8-bit cover)',
  // bullsVsBears: 'Vlad Costea -\nBulls vs Bears\n\n(Czino 8-bit cover)',
  // capitalCity: 'Capital City',
  // centralBankOpen: 'Central Bank Open',
  // centralBankAlert: 'Central Bank Alert',
  // underground: 'The Underground',
  // lagardesIntro: 'Lagarde\'s Intro',
  // lagardesTheme: 'Lagarde\'s Theme',
  // shore: 'Pier',
  // surferJim: 'BTC Minstrel -\nThe Ballad of\nSurfer Jim\n(Czino 8-bit cover)',
  // bearWhalesTheme: 'Bear Whale\'s Theme\n\nHeavy the Beat of the Weary Waves\n(Czino 8-bit cover)',
  // lambada: 'La Lambada\n\nLos Kjarkas - Llorando Se Fue\n(Czino 8-bit cover)',
  // diamondLights: 'Glenn and Chris -\nDiamond Lights\n(Czino 8-bit cover)',
  // johnnyBGoode: 'Johnny B Goode\n(Czino 8-bit cover)',
  theyCameFromAbove: 'Jim Reaper -\nThey Came From Above\n(Czino 8-bit cover)',
  dubInRuins: 'Dub In Ruins',
  cyberWorld: 'Cyber World',
  miningFarm: 'Mining Farm',
  citadelUnderAttack: 'Citadel Under Attack',
  funeral: 'Funeral',
  singlePoint: 'Single Point of Failure',
  wasteland: 'Shitcoin Wasteland',
  craigsCastle: 'Craig\'s Castle',
  hurry: 'Hurry',
  makeOrBreak: 'Make Or Break',
  gameOver: 'Game Over',
  intoSpace: 'Into Space',
  moon: 'Moon\n\nBadders - Triumph\n(Czino 8-bit cover)',
}
const getStartPos = ()=> ({
  x: Math.round(CTDLGAME.viewport.x + constants.WIDTH / 2 - 10),
  y: CTDLGAME.viewport.y + constants.HEIGHT / 3 + 120,
})

const getProtesters = () => {
  const protesters = []
  for (let i = 1; i < 57; i++) {
    protesters.push(
      new Citizen('protester-' + i, {
        x: getStartPos().x + Math.round(Math.random() * i * 2) - 60,
        y: getStartPos().y,
        direction: 'right',
        status: Math.random() < 0.24
          ? 'hold'
          : Math.random() < 0.1
            ? 'action'
            : 'attack',
        isUnhappy: true
      })
    )
  }
  return protesters
}


let currentAssets = null
export const assets = {
  mariamMatremVirginem: null,
  shaded: () => [
    new Character('hodlonaut', {
      x: getStartPos().x - 10,
      y: getStartPos().y,
      direction: 'right'
    }),
    new Character('katoshi', {
      x: getStartPos().x + 10,
      y: getStartPos().y,
      direction: 'left'
    }),
  ],
  imperayritzDeLaCiutatIoyosa: () => new NPC('mirco', getStartPos()),
  briansTheme: () => new Brian('brian', getStartPos()),
  santaMaria: () => new Rabbit('rabbit', getStartPos()),
  darkIsBetter: () => new NPC('honeybadger', getStartPos()),
  mempool: () => new Wiz(
    'wiz',
    {
      ...getStartPos(),
      spriteId: 'wiz',
      walkingSpeed: 1,
      business: 0.04
    }
  ),
  endOfTheRabbitHole: () => ([
    new NPC('RD_btc', {
      x: getStartPos().x - 8 * 2,
      y: getStartPos().y - 4,
    }),
    new NPC('dancer2', {
      x: getStartPos().x - 4 * 8,
      y: getStartPos().y,
    }),
    new NPC('dancer4', {
      x: getStartPos().x - 2 * 8,
      y: getStartPos().y,
    }),
    new NPC('dancer1', {
      x: getStartPos().x - 0 * 8,
      y: getStartPos().y,
    }),
    new NPC('dancer3', {
      x: getStartPos().x +2 * 8,
      y: getStartPos().y,
    }),
    new NPC('dancer5', {
      x: getStartPos().x + 4 * 8,
      y: getStartPos().y,
    }),
  ]),
  ivansTheme: () => new Ivan('ivan', getStartPos()),
  bear: () => new Bear('bear', getStartPos()),
  bossTheme: () => new Bagholder('bagholder', getStartPos()),
  aNewHope: () => new Bull('bull', {
    x: getStartPos().x - 20,
    y: getStartPos().y,
    vx: 0
  }),
  stellaSplendence: () => new NPC('monk', getStartPos()),
  ageispolis: () => new PMullr('pmullr',getStartPos()),
  bullsVsBears: () => [
    new Doge(
      'doge-1',
      {
        x: getStartPos().x - 21,
        y: getStartPos().y + 4,
        color: 'red',
        direction: 'left'
      }
    ),
    new Doge(
      'doge-2',
      {
        x: getStartPos().x - 4,
        y: getStartPos().y,
        color: 'green',
        direction: 'right'
      }
    ),
    new Doge(
      'doge-3',
      {
        x: getStartPos().x + 21,
        y: getStartPos().y,
        color: 'blue',
        direction: 'left'
      }
    ),
  ],
  capitalCity: () => [new Citizen('protest-leader', {
    x: getStartPos().x + 50,
    y: getStartPos().y - 23,
    direction: 'left',
    spriteId: 'citizen6',
    applyGravity: false,
    isUnhappy: true
  }),
  new Car('cotxe', {
    type: 'familyRed', 
    x: getStartPos().x + 14,
    y: getStartPos().y + 7
  }),
...getProtesters()],
  centralBankOpen: () => new SnakeBitken('snakeBitken',
      {
        ...getStartPos(),
        context: 'menuContext'
      }
    ),
  centralBankAlert: () => new Agustin(
    'agustin',
    {
      x: getStartPos().x - 30,
      y: getStartPos().y - 15,
      status: 'sitIdle',
      direction: 'right'
    }
  ),
  underground: () => new BabyLizard('babyLizard', getStartPos()),
  lagardesIntro: () => new Lagarde('lagarde', {
    ...getStartPos(),
    status: 'normal',
    hadIntro: true,
    canMove: false,
    transformed: false
  }),
  lagardesTheme: () => new Lagarde('lagarde', {
    ...getStartPos(),
    status: 'normal',
    hadIntro: true,
    canMove: false,
    transformed: false
  }),
  shore: () => new NakadaiMonarch('nakadai', getStartPos()),
  surferJim: () => new BitcoinPoet('poet', getStartPos()),
  bearWhalesTheme: () => [
    new Ferry('ferry', {
      x: getStartPos().x - 120,
      y: getStartPos().y - 10 ,
    }),
    new BearWhale('bearWahle', getStartPos()),
  ],
  lambada: () => [
    new BlueMoon(
      'blueMoon',
      {
        x: getStartPos().x - 40,
        y: getStartPos().y,
      }
    ),
    new Chappie(
      'chappie',
      {
        x: getStartPos().x - 30,
        y: getStartPos().y,
      }
    ),
    new HODLvirus(
      'hodlVirus',
      {
        x: getStartPos().x - 13,
        y: getStartPos().y + 10,
      }
    ),
    new Bitdov(
      'bitdov',
      {
        x: getStartPos().x,
        y: getStartPos().y,
      }
    ),
    new NPC(
      'cryptoCrab',
      {
        x: getStartPos().x + 39,
        y: getStartPos().y + 28,
      }
    ),
    new JoseSBam(
      'joseSBam',
      {
        x: getStartPos().x + 27,
        y: getStartPos().y - 10,
      }
    ),
  ],
  diamondLights: () => [
    new ChrisWhodl('chris', {
      x: getStartPos().x - 10,
      y: getStartPos().y,
      status: 'idle',
    }),
    new GlennHodl('glenn', {
      x: getStartPos().x + 20,
      y: getStartPos().y,
      status: 'idle',
    }),
  ],
  johnnyBGoode: () => new Vlad('vlad', getStartPos()),
  theyCameFromAbove: () => ([
    new NPC('RD_btc', {
      x: getStartPos().x,
      y: getStartPos().y - 4,
    }),
    new NPC('dancer1', {
      x: getStartPos().x + 4 * 8,
      y: getStartPos().y,
    }),
  ]),
  dubInRuins: () => new PoliceForce('police', getStartPos()),
  cyberWorld: () => new BankRobot('bankrobot', getStartPos()),
  miningFarm: () => new Blockchain('blockchain', getStartPos()),
  citadelUnderAttack: () => [
    new PoliceForce('police', {
      x: getStartPos().x - 20,
      y: getStartPos().y,
    }),
    new PoliceForce('police', {
      x: getStartPos().x - 10,
      y: getStartPos().y,
    }),
    new PoliceForce('police', {
      x: getStartPos().x,
      y: getStartPos().y,
    }),
    new PoliceForce('police', {
      x: getStartPos().x + 10,
      y: getStartPos().y,
    }),
    new PoliceForce('police', {
      x: getStartPos().x + 20,
      y: getStartPos().y,
    }),
  ],
  funeral: () => new AmericanHodl('americanHodl', getStartPos()),
  singlePoint: () => null,
  wasteland: () => [
    new Shitcoiner('shitcoiner', {
      x: getStartPos().x - 10,
      y: getStartPos().y,
    }),
    new Shitcoiner('shitcoiner', {
      x: getStartPos().x - 1,
      y: getStartPos().y,
    }),
    new Shitcoiner('shitcoiner', {
      x: getStartPos().x + 10,
      y: getStartPos().y,
      direction: 'right'
    }),
  ],
  craigsCastle: () => new Craig('craig', {...getStartPos(), hasArmor: true}),
  hurry: () => new Craig('craig', {...getStartPos(), hasArmor: false}),
  makeOrBreak: () => [
    new Character('hodlonaut', {
      x: getStartPos().x - 40,
      y: getStartPos().y,
      direction: 'right'
    }),
    new Craig('craig', {x: getStartPos().x + 40,
      y: getStartPos().y, hasArmor: false})
  ],
  intoSpace: () => null,
  moon: () => new Moon({x: getStartPos().x + 12, y: getStartPos().y}),
  gameOver: () => null,
}
const ambient = {
  endOfTheRabbitHole: () => {
    darken(.9, .81, '#170705')
    constants.menuContext.globalAlpha = .2
    constants.menuContext.fillStyle = CTDLGAME.frame % 32 >= 16 ? '#c8006e' : '#cd8812'
    constants.menuContext.fillRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
    constants.menuContext.globalAlpha = 1
  },
  theyCameFromAbove: () => {
    darken(.9, .81, '#170705')
    constants.menuContext.globalAlpha = .2
    constants.menuContext.fillStyle = CTDLGAME.frame % 32 >= 16 ? '#c8006e' : '#cd8812'
    constants.menuContext.fillRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
    constants.menuContext.globalAlpha = 1
  },
  lagardesTheme: () => {
    if (currentAssets.status === 'normal') {
      currentAssets.status = 'exhausted'
    } else if (currentAssets.status === 'exhausted' && Math.random() < 0.04) {
      currentAssets.status = 'transform'
      currentAssets.canMove = true
    }
  },
  gameOver: () => {
    constants.overlayContext.fillStyle = '#212121'
    constants.overlayContext.fillRect(
      CTDLGAME.viewport.x,
      CTDLGAME.viewport.y + constants.HEIGHT / 3,
      constants.WIDTH,
      51
    )
    constants.overlayContext.drawImage(
      CTDLGAME.assets.gameOver,
      0, 0, 41, 21,
      CTDLGAME.viewport.x + constants.WIDTH / 2 - 20,
      CTDLGAME.viewport.y + constants.HEIGHT / 3,
      41, 21
    )
  }
}
window.addEventListener('diamondLights', e => {
  if (!currentAssets.forEach) return
  if (!currentAssets.some(asset => asset.id === 'chris')) return
  currentAssets.forEach(asset => {

    asset.status = e.detail
  })
})
window.addEventListener('johnnyBGoode', e => {
  if (currentAssets.status === 'idle') return
  if (!e.detail) return
  currentAssets.direction = e.detail.direction
  currentAssets.status = e.detail.status
})
// thingsThingsICannotDescribe: 'Things Things I Cannot Describe',

export let currentTrack = Object.keys(soundtrack)[0]
export const setCurrentTrack = (track) => {
  currentTrack = track
  const newAssets = assets[track]?.()
  CTDLGAME.objects = []
  if (newAssets) {
    CTDLGAME.world = {
      w: constants.WIDTH,
      h: constants.HEIGHT,
      map: {
        state: {}
      }
    }
    currentAssets = newAssets
  } else {
    currentAssets = null
  }
}

/**
 * @description Method to display progress bar
 * @returns {void}
 */
export const showStartScreen = () => {
  window.SELECTEDCHARACTER = {
    status: 'idle',
  }
  CTDLGAME.quadTree = new QuadTree(new Boundary({
    x: CTDLGAME.viewport.x,
    y: CTDLGAME.viewport.y,
    w: constants.WIDTH,
    h: constants.HEIGHT
  }))
  if (logoOffsetTop < 0) logoOffsetTop += velocity
  if (logoOffsetTop === -velocity) {
    shock(1, .5)
  }
  if (logoOffsetTop === -velocity && CTDLGAME.options.sound) {
    window.SOUND.playSound('drop')
  }
  if (logoOffsetBottom > 0) logoOffsetBottom -= velocity
  if (logoOffsetBottom === velocity) {
    shock(-1, .5)
  }
  if (logoOffsetBottom === velocity && CTDLGAME.options.sound) {
    window.SOUND.playSound('drop')
  }
  if (musicStart > 0) musicStart -= velocity
  if (musicStart === velocity) window.SNDTRCK.initSoundtrack(currentTrack)

  constants.gameContext.clearRect(
    CTDLGAME.viewport.x,
    CTDLGAME.viewport.y + constants.HEIGHT / 3,
    constants.WIDTH,
    51
  )
  constants.gameContext.drawImage(
    CTDLGAME.assets.logo,
    0, 0, 41, 10,
    CTDLGAME.viewport.x + constants.WIDTH / 2 - 20 + logoOffsetTop,
    CTDLGAME.viewport.y + constants.HEIGHT / 3,
    41, 10
  )
  constants.gameContext.drawImage(
    CTDLGAME.assets.logo,
    0, 10, 41, 10,
    CTDLGAME.viewport.x + constants.WIDTH / 2 - 20 + logoOffsetBottom,
    CTDLGAME.viewport.y + constants.HEIGHT / 3 + 10,
    41, 10
  )
  if (!canDrawOn('menuContext')) return // do net render menu yet
  if (CTDLGAME.menuItem > 1) CTDLGAME.menuItem = 0
  if (CTDLGAME.menuItem < 0) CTDLGAME.menuItem = 1

  write(
    constants.menuContext,
       CTDLGAME.frame % (constants.FRAMERATES.menuContext * 8) > constants.FRAMERATES.menuContext * 4
        ? '~ '
        : '',
    {
      x: CTDLGAME.viewport.x + 15,
      y: CTDLGAME.viewport.y + newGameButton.y,
      w: CTDLGAME.viewport.w - 90
    },
    'left'
  )
  write(
    constants.menuContext,
    soundtrack[currentTrack],
    {
      x: CTDLGAME.viewport.x + 25,
      y: CTDLGAME.viewport.y + newGameButton.y,
      w: CTDLGAME.viewport.w - 20
    },
    'left'
  )
  if (currentAssets) {
    if (currentAssets.length) {
      currentAssets.forEach(asset => asset.update())
    } else {
      currentAssets.update()
    }
  }
  CTDLGAME.objects = CTDLGAME.objects.filter(obj => obj && !obj.remove)
  CTDLGAME.objects
    .filter(obj => obj.update)
    .forEach(obj => obj.update())

  CTDLGAME.quadTree.clear()
  CTDLGAME.objects
    .forEach(obj => CTDLGAME.quadTree.insert(obj))

  if (ambient[currentTrack]) ambient[currentTrack]()
}