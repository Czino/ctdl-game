// Czino - Companion

import triangle from './triangle'
import pulse from './pulse'

export default {
  id: 'companion',
  length: 40,
  loop: true,
  tracks: {
    triangle: triangle,
    pulse,
    noise: triangle
  },
  init: SNDTRCK => {
    SNDTRCK.devices.pulseSynth.envelope.release = 5.36
  },
  deinit: SNDTRCK => {
    SNDTRCK.devices.pulseSynth.envelope.release = 0.8
  }
}