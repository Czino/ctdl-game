// Johnny B Goode

import pulse1 from './pulse1'
import pulse2 from './pulse2'
import square from './square'
import triangle from './triangle'
import sine from './sine'
import event from './event'

export default {
  id: 'johnnyBGoode',
  length: 102.5667 + 2.3214,
  loop: false,
  bpm: 168,
  tracks: {
    noise: triangle,
    pulse: pulse1,
    pulse2,
    triangle,
    square,
    sine,
    event,
  }
}