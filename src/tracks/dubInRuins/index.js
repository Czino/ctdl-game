// Czino - Dub In Ruins

import noise from './noise'
import drum from './drum'
import triangle from './triangle'
import pulse1 from './pulse1'
import sine from './sine'

export default {
  id: 'dubInRuins',
  length: 21.9231 + 0.1154 * 2,
  loop: true,
  bpm: 130,
  tracks: {
    noise: noise,
    pulse: pulse1,
    triangle,
    drum: drum,
    sine,
  }
}