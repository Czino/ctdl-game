// Czino - Funeral

import triangle from './triangle'
import square from './square'
import pulse from './pulse'
import pulse2 from './pulse2'

export default {
  id: 'funeral',
  length: 54.135,
  loop: true,
  tracks: {
    triangle,
    square,
    pulse,
    pulse2
  },
  reverbs: ['pulse2Synth'],
  lfo: ['pulseSynth', 'pulse2Synth'],
  init: SNDTRCK => {
    SNDTRCK.devices.squareSynth.envelope.decay = .8
    SNDTRCK.devices.squareSynth.envelope.release = 1.8
    SNDTRCK.devices.triangleSynth.envelope.attack = 0.5
    SNDTRCK.devices.triangleSynth.envelope.decay = 1
    SNDTRCK.devices.triangleSynth.envelope.sustain = 1
    SNDTRCK.devices.triangleSynth.envelope.release = 2.2
    SNDTRCK.devices.pulseSynth.envelope.release = .8
    SNDTRCK.devices.pulse2Synth.envelope.attack = 0.5

    SNDTRCK.devices.autoFilter = new SNDTRCK.constructor.AutoFilter(.05)
    SNDTRCK.devices.triangleSynth.chain(
      SNDTRCK.devices.autoFilter,
      SNDTRCK.devices.gain
    )
    SNDTRCK.devices.squareSynth.chain(
      SNDTRCK.devices.autoFilter,
      SNDTRCK.devices.gain
    )
  },
  deinit: SNDTRCK => {
    SNDTRCK.devices.autoFilter.stop()
  }
}