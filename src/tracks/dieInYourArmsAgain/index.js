// Czino - Die In Your Arms Again

import triangle from './triangle'
import sine from './sine'
import pulse from './pulse'
import square from './square'

export default {
  id: 'dieInYourArmsAgain',
  length: 142.9213 + 0.7874,
  loop: true,
  tracks: {
    triangle: triangle,
    sine: sine,
    pulse,
    square
  }
}