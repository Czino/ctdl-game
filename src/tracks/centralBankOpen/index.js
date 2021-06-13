// Czino - Central Bank Open

import sine from './sine'
import triangle from './triangle'
import square from './square'
import pulse from './pulse'
import noise from './noise'

export default {
  id: 'centralBankOpen',
  length: 2 * 60 + 12.413,
  loop: true,
  tracks: {
    sine,
    triangle,
    square: square.map(note => {
      note[3] = .01
      return note
    }),
    pulse,
    pulse2: sine.map(note => {
      note[3] = .01
      return note
    }),
    noise
  },
  reverbs: ['pulseSynth'],
  lfo: ['pulseSynth'],
  init: SNDTRCK => {
    SNDTRCK.devices.squareSynth.envelope.attack = 4
    SNDTRCK.devices.squareSynth.envelope.decay = .005
    SNDTRCK.devices.squareSynth.envelope.sustain = .3
    SNDTRCK.devices.squareSynth.envelope.release = 2
    SNDTRCK.devices.pulseSynth.envelope.attack = 0.05
    SNDTRCK.devices.pulseSynth.envelope.decay = 1
    SNDTRCK.devices.pulseSynth.envelope.sustain = .2
    SNDTRCK.devices.pulseSynth.envelope.release = 2
    SNDTRCK.devices.sineSynth.envelope.attack = 0.005
    SNDTRCK.devices.sineSynth.envelope.release = 0.05
    SNDTRCK.devices.pulse2Synth.envelope.attack = 0.005
    SNDTRCK.devices.pulse2Synth.envelope.release = 0.05
    SNDTRCK.devices.noiseSynth.envelope.attack = 0.005
    SNDTRCK.devices.noiseSynth.envelope.decay = 0.005
    SNDTRCK.devices.noiseSynth.envelope.sustain = 0.3
    SNDTRCK.devices.noiseSynth.envelope.release = 0.05

    SNDTRCK.devices.autoFilter = new SNDTRCK.constructor.AutoFilter(.05)
    SNDTRCK.devices.pulseSynth.chain(
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