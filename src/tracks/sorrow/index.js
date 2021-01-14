// Czino - Sorrow

import triangle from './triangle'
import square from './square'
import sine from './sine'
import pulse from './pulse'
import pulse2 from './pulse2'

export default {
  id: 'sorrow',
  length: 73.333,
  loop: true,
  tracks: {
    triangle,
    noise: triangle,
    square,
    sine,
    pulse,
    pulse2
  }
}