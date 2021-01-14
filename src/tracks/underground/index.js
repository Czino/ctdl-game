// Czino - Underground

import triangle from './triangle'
import sine from './sine'
import drum from './drum'
import noise from './noise'
import brownNoise from './brownNoise'

export default {
  id: 'underground',
  length: 53.333,
  loop: true,
  tracks: {
    triangle,
    sine,
    drum,
    noise,
    brownNoise,
  }
}