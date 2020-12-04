// Czino - Brian's theme

import noise from './noise'
import triangle from './triangle'
import pulse1 from './pulse1'

export default {
  id: 'briansTheme',
  length: 31.8333 + 0.1667,
  loop: true,
  tracks: {
    noise: noise,
    pulse: pulse1,
    triangle: triangle,
  }
}