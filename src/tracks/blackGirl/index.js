// Czino - Black Girl

import triangle from './triangle'
import sine from './sine'
import square from './square'
import pulse from './pulse'
import pulse2 from './pulse2'

export default {
  id: 'blackGirl',
  length: 36.09,
  loop: true,
  tracks: {
    triangle: sine,
    pulse: pulse,
    pulse2: pulse2,
    sine: triangle,
    square,
    drum: sine
  }
}