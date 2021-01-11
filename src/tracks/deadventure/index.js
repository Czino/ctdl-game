// Czino - Deadventure

import triangle from './triangle'
import square from './square'
import pulse from './pulse'
import pulse2 from './pulse2'

export default {
  id: 'deadVenture',
  length: 24,
  loop: true,
  tracks: {
    triangle: triangle,
    square: square,
    pulse,
    pulse2,
  }
}