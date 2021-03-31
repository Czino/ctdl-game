// Glenn & Chris - Diamond Lights

import triangle from './triangle'
import sine from './sine'
import pulse from './pulse'
import pulse2 from './pulse2'
import noise from './noise'
import brownNoise from './brownNoise'
import drum from './drum'
import event from './event'

export default {
  id: 'diamondLights',
  length: 3 * 60 + 10.479,
  loop: false,
  tracks: {
    square: triangle,
    sine,
    pulse,
    pulse2,
    triangle,
    noise,
    brownNoise,
    drum,
    event
  }
}