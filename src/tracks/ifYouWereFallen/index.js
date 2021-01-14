// Czino - If you were fallen

import triangle from './triangle'
import pulse from './pulse'

export default {
  id: 'ifYouWereFallen',
  length: 90,
  loop: true,
  tracks: {
    triangle,
    brownNoise: triangle,
    sine: pulse
  }
}