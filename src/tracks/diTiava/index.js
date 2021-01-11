// Czino - diTiava

import triangle from './triangle'
import sine from './sine'
import pulse from './pulse'
import pulse2 from './pulse2'

export default {
  id: 'diTiava',
  length: 116.8,
  loop: true,
  tracks: {
    triangle: triangle,
    sine: sine,
    pulse,
    square: pulse2
  },
  init: SNDTRCK => {
    SNDTRCK.devices.squareSynth.envelope.release = 8.36
  },
  deinit: SNDTRCK => {
    SNDTRCK.devices.squareSynth.envelope.release = 0.8
  }
}