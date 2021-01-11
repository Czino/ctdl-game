// Czino - Cyberworld

import sine from './sine'
import pulse from './pulse'

export default {
  id: 'cyberWorld',
  length: 27.9699 + 0.78744,
  loop: true,
  tracks: {
    drum: sine,
    noise: pulse
  },

  bpm: 133,
  delay: 0.33,
  delayFeedback: .8,
  delays: [
    'drumSynth'
  ]
}