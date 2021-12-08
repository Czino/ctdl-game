// Czino - 7th Master Key

import triangle from './triangle'
import square from './square'
import sine from './sine'
import pulse from './pulse'
import pulse2 from './pulse2'

export default {
  id: '7thMasterKey',
  length: 107.463,
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
  }
}