// Czino - Sunshine

import triangle from './triangle'
import sine from './sine'
import pulse from './pulse'

export default {
  id: 'sunshine',
  length: 4.865,
  loop: true,
  tracks: {
    triangle,
    sine,
    pulse
  },
  init: SNDTRCK => {
    SNDTRCK.devices.triangleSynth.envelope.release = 16
    SNDTRCK.devices.sineSynth.envelope.release = 16
    SNDTRCK.devices.pulseSynth.envelope.release = 16
  },
  deinit: SNDTRCK => {
    SNDTRCK.devices.triangleSynth.envelope.release = 0.07
    SNDTRCK.devices.sineSynth.envelope.release = 0.07
    SNDTRCK.devices.pulseSynth.envelope.release = 0.07
  }
}