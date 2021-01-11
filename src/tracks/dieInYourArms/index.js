// Czino - Die In Your Arms

import triangle from './triangle'
import sine from './sine'
import pulse from './pulse'
import square from './square'

export default {
  id: 'dieInYourArms',
  length: 124.5111 + 0.7874,
  loop: true,
  tracks: {
    triangle: triangle,
    sine: sine,
    pulse,
    square
  }
}