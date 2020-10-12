import { random } from '../arrayUtils'
import { addTextToQueue } from '../textUtils'

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
  }
}