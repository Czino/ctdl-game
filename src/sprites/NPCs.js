import { CTDLGAME } from '../gameUtils'
import { random } from '../arrayUtils'
import { addTextToQueue } from '../textUtils'
import constants from '../constants'
import Explosion from '../Explosion'
import { playSound } from '../sounds'

export default {
  'monk': {
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
  'dave': {
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
  'peter': {
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
  'mirco': {
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
  'wizardWithNoMoney': {
    frames: [
      // TODO add sprite 
      { x: 0, y: 30, w: 11, h: 25 }
    ],
    select: npc => {
      addTextToQueue('Wizard with no money:\nI wish I could use my magic\nto create Bitcoin.\nBut by Merlin\'s beard...\nit\'s impossible!', () => {
        npc.isSelected = false
      })
    }

  },
  'wyd_idk': {
    frames: [
      // TODO add sprite (inspiration https://www.google.com/imgres?imgurl=https%3A%2F%2Fcdnb.artstation.com%2Fp%2Fassets%2Fimages%2Fimages%2F009%2F914%2F965%2Flarge%2Foscar-kadejo-eva012.jpg%3F1521564808&imgrefurl=https%3A%2F%2Fkadejo.artstation.com%2Fprojects%2F3XqDo&tbnid=g7rk7UUqOpUZ6M&vet=12ahUKEwiToqaUr7fsAhULixoKHe3vCUUQMygHegUIARC0AQ..i&docid=gAzhw6XeyhMPAM&w=1250&h=1250&q=evangelion%20pixel%20art&ved=2ahUKEwiToqaUr7fsAhULixoKHe3vCUUQMygHegUIARC0AQ)
      { x: 0, y: 30, w: 11, h: 25 }
    ],
    select: npc => {
      addTextToQueue('wyd_idk:\nLess and less time is left before "Second Impact", stop trading shitcoins and look at your future seriously, Bitcoin has the most powerful monetary system, that\'s the only thing what matters.', () => {
        npc.isSelected = false
      })
    }
  },
  'elon': {
    frames: [
      // TODO add sprite of (Elon the bull)
      { x: 0, y: 30, w: 11, h: 25 }
    ],
    select: npc => {
      addTextToQueue('Elon:\nMoOOooOOon', () => {
        npc.isSelected = false
      })
    }
  },
  'leprikon': {
    frames: [
      // TODO add sprite of leprikon
      { x: 0, y: 30, w: 11, h: 25 }
    ],
    select: npc => {
      addTextToQueue('Leprikon:\nAre you looking for my pot of gold?\nWell bad luck, I don\'t need a\npot to store my wealth anymore.', () => {
        npc.isSelected = false
      })
    }

  }
}