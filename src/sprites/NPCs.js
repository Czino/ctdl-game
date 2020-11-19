import { CTDLGAME, getTimeOfDay } from '../gameUtils'
import { random } from '../arrayUtils'
import { addTextToQueue } from '../textUtils'
import constants from '../constants'
import Explosion from '../Explosion'
import { playSound } from '../sounds'

export default {
  monk: {
    frames: [
      { x: 0, y: 0, w: 11, h: 15 }
    ],
    select: npc => {
      addTextToQueue('Monk:\nCome to me if you seek\nenlightenment.', () => {
        npc.isSelected = false
      })
    },
    touch: npc => {
      const thingsToSay = [
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
    }
  },
  dave: {
    frames: [
      { x: 0, y: 15, w: 11, h: 15 },
      { x: 11, y: 15, w: 11, h: 15 }
    ],
    select: npc => {
      addTextToQueue('Dave:\nI wish I held Bitcoin\nlonger than just a week.', () => {
        npc.isSelected = false
      })
    },
    touch: npc => {
      const thingsToSay = [
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
    }
  },
  peter: {
    frames: [
      { x: 0, y: 30, w: 11, h: 25 }
    ],
    select: npc => {
      addTextToQueue('Peter:\nGold has intrinsic value.', () => {
        npc.isSelected = false
      })
    },
    touch: npc => {
      const thingsToSay = [
        [
          'Peter:\nBuy my gold!'
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
    }
  },
  mirco: {
    frames: [
      { x: 0, y: 55, w: 17, h: 32 }
    ],
    select: npc => {
      CTDLGAME.prompt = {
        text: 'Mirco:\nGive me one Bitcoin and\nI will tell you the truth',
        payload: npc,
        ok: npc => {
          if (CTDLGAME.inventory.sats >= 100000000) {
            CTDLGAME.inventory.sats -= 100000000
            addTextToQueue('Mirco:\nThe truth is, you just lost\none Bitcoin', () => {
              npc.isSelected = false
              npc.remove = true
              playSound('magic')
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
    },
  },
  wizardWithNoMoney: {
    frames: [
      { x: 52, y: 0, w: 13, h: 28 },
      { x: 66, y: 0, w: 13, h: 28 }
    ],
    static: true,
    select: npc => {
      npc.frame = window.SELECTEDCHARACTER.getCenter().x > npc.getCenter().x ? 1 : 0
      addTextToQueue('Wizard with no money:\nI wish I could use my magic\nto create Bitcoin.')
      addTextToQueue('Wizard with no money:\nBut by Merlin\'s beard...\nit\'s impossible!', () => {
        npc.isSelected = false
      })
    }
  },
  wyd_idk: {
    frames: [
      { x: 20, y: 0, w: 19, h: 27 }
    ],
    select: npc => {
      addTextToQueue('wyd_idk:\nLess and less time is left\nbefore "Second Impact".')
      addTextToQueue('wyd_idk:\nStop trading shitcoins\nand look at your\nfuture seriously!')
      addTextToQueue('wyd_idk:\nBitcoin has the most\npowerful monetary system.')
      addTextToQueue('wyd_idk:\nThat\'s the only thing\nthat matters.', () => {
        npc.isSelected = false
      })
    }
  },
  elon: {
    frames: [
      { x: 20, y: 32, w: 28, h: 54 },
      { x: 48, y: 32, w: 28, h: 54 }
    ],
    static: true,
    select: npc => {
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
    },
    touch: npc => {
      if (CTDLGAME.isNight) {
        npc.frame = 1
        addTextToQueue('Elon:\nMoOOooOOon', () => {
          npc.isTouched = false
          npc.frame = 0
        })
      } else {
        addTextToQueue('Elon:\nMoon?', () => {
          npc.isTouched = false
        })
      }
    }
  },
  leprikon: {
    frames: [
      { x: 40, y: 0, w: 11, h: 16 }
    ],
    touch: npc => {
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
    select: npc => {
      addTextToQueue('Leprikon:\nAre ye looking for me\npot of gold?')
      addTextToQueue('Leprikon:\nWell bad luck, oi don\'t need a\npot to store me wealth\nanymore.', () => {
        npc.isSelected = false
      })
    }
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
    select: npc => {
      addTextToQueue('RD_btc:\nHODL!', () => {
        npc.isSelected = false
      })
    }
  },
  vlad: {
    // make him play a red Gibson ES 335 or a Fender Telecaster
    frames: [
      { x: 79, y: 28, w: 8, h: 8 }
    ],
    select: npc => {
      addTextToQueue('Vlad:\Don’t forget that you were born free. This is a powerful thought that will one day break all chains!', () => {
        npc.isSelected = false
      })
    }
  },
}