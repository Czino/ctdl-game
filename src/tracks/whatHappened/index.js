// Czino - What happened

import triangle from './triangle'
import square from './square'
import pulse1 from './pulse1'
import pulse2 from './pulse2'
import sine from './sine'

export default {
  id: 'whatHappened',
  length: 15.3194 + 0.3333,
  loop: true,
  tracks: {
    noise: triangle,
    pulse: pulse1,
    pulse2,
    triangle,
    sine,
    square
  }
}