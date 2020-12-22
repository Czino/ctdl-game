// Czino - Hurry

import triangle from './triangle'
import pulse1 from './pulse1'
import pulse2 from './pulse2'

export default {
  id: 'hurry',
  length: 18.8844 + 0.3,
  loop: true,
  tracks: {
    noise: triangle,
    triangle,
    pulse: pulse1,
    pulse2
  }
}