// Czino - Shaded

import triangle from './triangle'
import sine from './sine'

export default {
  id: 'shaded',
  length: 38.710,
  loop: true,
  tracks: {
    triangle,
    sine,
  },
  init: SNDTRCK => {
    SNDTRCK.devices.triangleSynth.envelope.release = 16
    SNDTRCK.devices.sineSynth.envelope.release = 16
  },
  deinit: SNDTRCK => {
    SNDTRCK.devices.triangleSynth.envelope.release = 0.07
    SNDTRCK.devices.sineSynth.envelope.release = 0.07
  }
}