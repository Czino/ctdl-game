import { CTDLGAME, getTimeOfDay } from '../gameUtils'
import { random } from '../arrayUtils'
import { addTextToQueue } from '../textUtils'
import constants from '../constants'
import Explosion from '../Explosion'

const mircoEvent = npc => {
  CTDLGAME.prompt = {
    text: 'Mirco:\nGive me one Bitcoin and\nI will tell you the truth',
    payload: npc,
    ok: npc => {
      if (CTDLGAME.inventory.sats >= 100000000) {
        CTDLGAME.inventory.sats -= 100000000
        addTextToQueue('Mirco:\nThe truth is, you just lost\none Bitcoin', () => {
          npc.isSelected = false
          npc.remove = true
          window.SOUND.playSound('magic')
          CTDLGAME.objects.push(new Explosion(constants.gameContext, { x: npc.getCenter().x, y: npc.getCenter().y }))
        })
      } else {
        addTextToQueue('Mirco:\nCome back when\nyou have the money', () => {
          npc.isSelected = false
        })
      }
    },
    cancel: npc => {
      addTextToQueue('Mirco:\nCome back when\nyou have the money', () => {
        npc.isSelected = false
      })
    }
  }
}

const wizardWithNoMoneyEvent = npc => {
  npc.frame = window.SELECTEDCHARACTER.getCenter().x > npc.getCenter().x ? 1 : 0
  addTextToQueue('Wizard with no money:\nI wish I could use my magic\nto create bitcoin.')
  addTextToQueue('Wizard with no money:\nBut by Merlin\'s beard...\nit\'s impossible!', () => {
    npc.isSelected = false
  })
}

const elonEvent = npc => {
  if (npc.isSelected) return
  npc.isSelected = true
  if (CTDLGAME.isNight) {
    npc.frame = 1
    addTextToQueue('Elon:\nMoOOooOOon', () => {
      npc.isSelected = false
      npc.frame = 0
    })
  } else {
    addTextToQueue('Elon:\nMoon?', () => {
      npc.isSelected = false
    })
  }
}

const lokulEvent = npc => {
  if (npc.isSelected) return
  npc.frame = 1

  let thingsToSaySelect = [
    ['Lokul:\nI\'m the worst party guest\never.'],
    [
      'Lokul:\nKill your ego. POW is all that matters. We will not erode your past work',
      'Lokul:\nbut if your ego stands in\nthe way you will get rekt.'
    ],
    ['Lokul:\nRule #2 the only thing you\nown is your mind prior to\nexpression.'],
    ['Lokul:\nSo anything interesting\nhappen today? Been away\nfrom my phone all day.'],
    ['Lokul:\nShitcoins are literally a\nsiren song.']
  ]

  npc.isSelected = true

  let whatToSay = random(thingsToSaySelect)
  whatToSay.map((text, index) => {
    if (index === whatToSay.length - 1) {
      addTextToQueue(text, () => {
        npc.frame = 0
        npc.isSelected = false
      })
    } else {
      addTextToQueue(text)
    }
  })
}

export default {
  monk: {
    frames: [
      { x: 0, y: 0, w: 11, h: 15 }
    ],
    thingsToSayTouch: [
      [
        'Monk:\nCome to me if you seek\nenlightenment.'
      ]
    ],
    thingsToSaySelect: [
      [
        'Monk:\nI have meditated...',
        'Monk:\nIf you get stuck\nyou can get a better view\nby climbing high'
      ],
      [
        'Monk:\nI have meditated...',
        'Monk:\nBears usually growl\n before they attack'
      ],
      [
        'Monk:\nI fell into the rabbit hole'
      ],
      [
        'Monk:\nI have meditated\n on Bitcoin...',
        'Monk:\nBitcoin is a social\nphenomenon with many\nparallels to the mushroom'
      ],
      [
        'Monk:\nI have meditated\n on Bitcoin...',
        'Monk:\nBitcoin is cosmic,\nat its core'
      ],
      [
        'Monk:\nI have meditated\n on Bitcoin...',
        'Monk:\nBitcoin is a teacher'
      ],
      [
        '*mumbling*\nDont trust, verify\nDont trust, verify\nDont trust, verify...'
      ]
    ]
  },
  dave: {
    frames: [
      { x: 0, y: 15, w: 11, h: 15 },
      { x: 11, y: 15, w: 11, h: 15 }
    ],
    thingsToSaySelect: [
      [
        'Dave:\nI wish I held Bitcoin\nlonger than just a week.'
      ]
    ],
    thingsToSayTouch: [
      [
        'Dave:\nPlease, I need some sats...'
      ],
      [
        'Dave:\nHave a sat to spare?'
      ],
      [
        'Dave:\nI used to be rich...'
      ],
      [
        'Dave:\nHow are your hands\nso strong?'
      ]
    ]
  },
  // TODO add SideQuest "Schiff's Gold"
  peter: {
    frames: [
      { x: 0, y: 30, w: 11, h: 25 }
    ],
    thingsToSaySelect: [
      [
        'Peter:\nGold has intrinsic value.'
      ]
    ],
    thingsToSayTouch: [
      [
        'Peter:\nBuy my gold!'
      ]
    ]
  },
  mirco: {
    frames: [
      { x: 0, y: 55, w: 17, h: 32 }
    ],
    select: mircoEvent,
    backEvent: mircoEvent,
  },
  wizardWithNoMoney: {
    frames: [
      { x: 52, y: 0, w: 13, h: 28 },
      { x: 66, y: 0, w: 13, h: 28 }
    ],
    static: true,
    select: wizardWithNoMoneyEvent,
    backEvent: wizardWithNoMoneyEvent
  },
  roger: {
    frames: [
      { x: 79, y: 37, w: 10, h: 16 }
    ],
    thingsToSayTouch: [
      ['Roger:\nI can\'t believe some people\nstill think BTC is Bitcoin...'],
      ['Roger:\nThey laughed at me in\nthe mempool...'],
      ['Roger:\nBitcoin was designed to be\ndigital cash used to make\npayments over the internet.']
    ],
    thingsToSaySelect: [
      ['Roger:\nBitcoin is a peer-to-peer\nelectronic cash system...'],
      ['Roger:\nAll I want is Bitcoin to be\nused as cash...']
    ]
  },
  wyd_idk: {
    frames: [
      { x: 20, y: 0, w: 19, h: 27 }
    ],
    thingsToSaySelect: [
      [
        'wyd_idk:\nLess and less time is left\nbefore "Second Impact".',
        'wyd_idk:\nStop trading shitcoins\nand look at your\nfuture seriously!',
        'wyd_idk:\nBitcoin has the most\npowerful monetary system.',
        'wyd_idk:\nThat\'s the only thing\nthat matters.'
      ]
    ]
  },
  elon: {
    frames: [
      { x: 20, y: 32, w: 28, h: 54 },
      { x: 48, y: 32, w: 28, h: 54 }
    ],
    static: true,
    select: elonEvent,
    touch: elonEvent
  },
  leprikon: {
    frames: [
      { x: 40, y: 0, w: 11, h: 16 }
    ],
    touch: npc => {
      if (npc.isTouched) return
      npc.isTouched = true
      let time = Math.round(getTimeOfDay() * 2) / 2

      if (time % 1 === 0.5) {
        time = `half ${Math.floor(time)}`
      } else {
        time = `${time} o'clock`
      }

      const thingsToSay = [
        [
          'Leprikon:\nWhere\'s the craic lad?'
        ],
        [
          `Leprikon:\nIt's ${time}.`
        ],
        [
          'Leprikon:\nDuck, if ye want to\nappreciate the shamrocks.'
        ]
      ]

      let whatToSay = random(thingsToSay)
      whatToSay.map((text, index) => {
        if (index === whatToSay.length - 1) {
          addTextToQueue(text, () => {
            npc.isTouched = false
          })
        } else {
          addTextToQueue(text)
        }
      })
      
    },
    thingsToSaySelect: [
      [
        'Leprikon:\nAre ye looking for me\npot of gold?',
        'Leprikon:\nWell bad luck, oi don\'t need a\npot to store me wealth\nanymore.'
      ]
    ]
  },
  honeybadger: {
    frames: [
      { x: 79, y: 0, w: 16, h: 9 },
      { x: 79, y: 0, w: 16, h: 9 },
      { x: 79, y: 0, w: 16, h: 9 },
      { x: 79, y: 0, w: 16, h: 9 },
      { x: 79, y: 0, w: 16, h: 9 },
      { x: 79, y: 0, w: 16, h: 9 },
      { x: 79, y: 0, w: 16, h: 9 },
      { x: 79, y: 8, w: 16, h: 9 },
      { x: 79, y: 8, w: 16, h: 9 },
      { x: 79, y: 8, w: 16, h: 9 },
      { x: 79, y: 8, w: 16, h: 9 },
      { x: 79, y: 16, w: 16, h: 9 },
      { x: 79, y: 16, w: 16, h: 9 },
      { x: 79, y: 16, w: 16, h: 9 },
      { x: 79, y: 16, w: 16, h: 9 },
      { x: 79, y: 16, w: 16, h: 9 },
      { x: 79, y: 16, w: 16, h: 9 },
      { x: 79, y: 16, w: 16, h: 9 },
      { x: 79, y: 8, w: 16, h: 9 },
      { x: 79, y: 8, w: 16, h: 9 },
      { x: 79, y: 8, w: 16, h: 9 },
      { x: 79, y: 8, w: 16, h: 9 },
    ]
  },
  dancer1: {
    sprite: 'dancers',
    frames: [
      { x: 0, y: 0, w: 12, h: 24 },
      { x: 0, y: 24, w: 12, h: 24 },
      { x: 0, y: 48, w: 12, h: 24 },
      { x: 0, y: 72, w: 12, h: 24 },
      { x: 0, y: 96, w: 12, h: 24 },
      { x: 0, y: 120, w: 12, h: 24 },
      { x: 0, y: 144, w: 12, h: 24 },
      { x: 0, y: 168, w: 12, h: 24 },
      { x: 0, y: 192, w: 12, h: 24 },
      { x: 0, y: 216, w: 12, h: 24 },
      { x: 0, y: 48, w: 12, h: 24 },
      { x: 0, y: 72, w: 12, h: 24 },
      { x: 0, y: 96, w: 12, h: 24 },
      { x: 0, y: 120, w: 12, h: 24 },
      { x: 0, y: 144, w: 12, h: 24 },
      { x: 0, y: 168, w: 12, h: 24 },
      { x: 0, y: 192, w: 12, h: 24 },
      { x: 0, y: 216, w: 12, h: 24 },
      { x: 0, y: 48, w: 12, h: 24 },
      { x: 0, y: 72, w: 12, h: 24 },
      { x: 0, y: 96, w: 12, h: 24 },
      { x: 0, y: 120, w: 12, h: 24 },
      { x: 0, y: 144, w: 12, h: 24 },
      { x: 0, y: 168, w: 12, h: 24 },
      { x: 0, y: 192, w: 12, h: 24 },
      { x: 0, y: 216, w: 12, h: 24 },
      { x: 0, y: 48, w: 12, h: 24 },
      { x: 0, y: 72, w: 12, h: 24 },
      { x: 0, y: 96, w: 12, h: 24 },
      { x: 0, y: 120, w: 12, h: 24 },
      { x: 0, y: 144, w: 12, h: 24 },
      { x: 0, y: 168, w: 12, h: 24 },
      { x: 0, y: 192, w: 12, h: 24 },
      { x: 0, y: 216, w: 12, h: 24 },
      { x: 0, y: 240, w: 12, h: 24 },
      { x: 0, y: 264, w: 12, h: 24 },
      { x: 0, y: 288, w: 12, h: 24 },
      { x: 0, y: 312, w: 12, h: 24 },
      { x: 0, y: 336, w: 12, h: 24 },
      { x: 0, y: 360, w: 12, h: 24 },
      { x: 0, y: 384, w: 12, h: 24 },
      { x: 0, y: 408, w: 12, h: 24 },
      { x: 0, y: 48, w: 12, h: 24 },
      { x: 0, y: 72, w: 12, h: 24 },
      { x: 0, y: 96, w: 12, h: 24 },
      { x: 0, y: 120, w: 12, h: 24 },
      { x: 0, y: 144, w: 12, h: 24 },
      { x: 0, y: 168, w: 12, h: 24 },
      { x: 0, y: 192, w: 12, h: 24 },
      { x: 0, y: 216, w: 12, h: 24 },
    ]
  },
  dancer2: {
    sprite: 'dancers',
    frames: [
      { x: 12, y: 0, w: 12, h: 24 },
      { x: 12, y: 24, w: 12, h: 24 },
      { x: 12, y: 48, w: 12, h: 24 },
      { x: 12, y: 72, w: 12, h: 24 },
      { x: 12, y: 96, w: 12, h: 24 },
      { x: 12, y: 120, w: 12, h: 24 },
      { x: 12, y: 144, w: 12, h: 24 },
      { x: 12, y: 168, w: 12, h: 24 },
      { x: 12, y: 192, w: 12, h: 24 }
    ]
  },
  dancer3: {
    sprite: 'dancers',
    frames: [
      { x: 24, y: 0, w: 17, h: 24 },
      { x: 24, y: 24, w: 17, h: 24 },
      { x: 24, y: 48, w: 17, h: 24 },
      { x: 24, y: 72, w: 17, h: 24 },
      { x: 24, y: 96, w: 17, h: 24 },
      { x: 24, y: 120, w: 17, h: 24 }
    ]
  },
  dancer4: {
    sprite: 'dancers',
    frames: [
      { x: 40, y: 0, w: 17, h: 24 },
      { x: 40, y: 24, w: 17, h: 24 },
      { x: 40, y: 48, w: 17, h: 24 },
      { x: 40, y: 72, w: 17, h: 24 }
    ]
  },
  dancer5: {
    sprite: 'dancers',
    frames: [
      { x: 57, y: 0, w: 17, h: 24 },
      { x: 57, y: 24, w: 17, h: 24 },
      { x: 57, y: 48, w: 17, h: 24 },
      { x: 57, y: 72, w: 17, h: 24 }
    ]
  },
  RD_btc: {
    frames: [
      { x: 79, y: 28, w: 8, h: 8 },
      { x: 79, y: 28, w: 8, h: 8 },
      { x: 87, y: 28, w: 8, h: 8 },
      { x: 87, y: 28, w: 8, h: 8 }
    ],
    thingsToSaySelect: [
      ['RD_btc:\nHODL!']
    ]
  },
  cryptoCrab: {
    frames: [
      { x: 78, y: 54, w: 17, h: 6 }
    ],
    thingsToSaySelect: [
      ['Crypto 69 Crab 420:\nFeeling crabby'],
      ['Crypto 69 Crab 420:\nIf drugs, alcohol, and violence don\'t work, try alt coins.'],
      ['Crypto 69 Crab 420:\nI would help you but I\'m late for my appointment at the claw salon.'],
      ['Crypto 69 Crab 420:\nHello I am your crab friend.'],
      ['Crypto 69 Crab 420:\nCome closer. I won\'t pinch']
    ]
  },
  lokul: {
    frames: [
      { x: 0, y: 88, w: 9, h: 28 },
      { x: 10, y: 88, w: 9, h: 28 }
    ],
    static: true,
    select: lokulEvent,
    thingsToSayTouch: [
      ['Lokul:\n...It\'s a really really really\nreally really big number.'],
      ['Lokul:\n...Nah, fuck that guy...'],
      ['Lokul:\n...Of course a government\nemployee is into the doge...'],
      ['Lokul:\n...It\'s not a predator,\nit\'s a black hole.\nSmall, until it\'s not...'],
      ['Lokul:\n...buncha sun ballin\' mfers.\nlfg!'],
      ['Lokul:\n...Greg is the worst. There\'s a reason we say FU Greg...'],
      ['Lokul:\n...Hit \'em with\n"Who is John Galt"...']
    ]
  },
  // Just converted my dads retirement fnd into $link
  // A homeless man once told me he could tell the state of the economy based on the length of the cigarette butts that people throw on the ground
}