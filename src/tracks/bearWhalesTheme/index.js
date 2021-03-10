// Heavy the Beat of the Weary Waves (Czino 8-bit remix)

import triangle from './triangle'
import square from './square'
import sine from './sine'
import pulse from './pulse'
import pulse2 from './pulse2'
import noise from './noise'
import drum from './drum'

export default {
  id: 'bearWhalesTheme',
  length: 55.890,
  loop: true,
  tracks: {
    triangle: square,
    brownNoise: triangle,
    square: triangle,
    pulse: sine,
    sine: pulse,
    pulse2,
    noise,
    drum
  }
}