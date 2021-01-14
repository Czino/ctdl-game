// Czino - Hydra

import triangle from './triangle'
import square from './square'
import sine from './sine'
import drum from './drum'
import noise from './noise'
import brownNoise from './brownNoise'

export default {
  id: 'hydra',
  length: 110.769,
  loop: true,
  tracks: {
    triangle,
    square,
    sine,
    drum,
    noise,
    brownNoise,
  }
}