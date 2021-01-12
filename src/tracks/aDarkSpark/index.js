// Czino - A Dark Spark

import triangle from './triangle'
import square from './square'
import pulse2 from './pulse2'
import sine from './sine'
import drum from './drum'

export default {
  id: 'aDarkSpark',
  length: 82.286,
  loop: true,
  tracks: {
    triangle,
    noise: triangle,
    square,
    pulse2,
    sine,
    drum
  }
}