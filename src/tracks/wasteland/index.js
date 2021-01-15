// Czino - Wasteland

import triangle from './triangle'
import square from './square'
import sine from './sine'
import pulse from './pulse'
import pulse2 from './pulse2'

export default {
  id: 'wasteland',
  length: 92.903,
  loop: true,
  tracks: {
    triangle,
    square,
    sine,
    pulse,
    pulse2
  },
  init: SNDTRCK => {
    SNDTRCK.devices.triangleSynth.envelope.release = 16
    SNDTRCK.devices.squareSynth.envelope.release = 16
    SNDTRCK.devices.sineSynth.envelope.release = 16
    SNDTRCK.devices.pulseSynth.envelope.release = 16
    SNDTRCK.devices.pulse2Synth.envelope.release = 16
  },
  deinit: SNDTRCK => {
    SNDTRCK.devices.triangleSynth.envelope.release = 0.07
    SNDTRCK.devices.squareSynth.envelope.release = 0.07
    SNDTRCK.devices.sineSynth.envelope.release = 0.07
    SNDTRCK.devices.pulseSynth.envelope.release = 0.07
    SNDTRCK.devices.pulse2Synth.envelope.release = 0.07
  }
}