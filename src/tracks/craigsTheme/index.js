// Czino - CraigsTheme

import triangle from './triangle'
import sine from './sine'
import pulse from './pulse'
import pulse2 from './pulse2'
import square from './square'
import drum from './square'

export default {
  id: 'craigsTheme',
  length: 156,
  loop: true,
  tracks: {
    triangle: triangle,
    pulse,
    pulse2: pulse2,
    sine: sine,
    square: square,
    drum: drum
  }
}