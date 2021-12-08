// Czino - Central Bank Alert

import triangle from './triangle'
import square from './square'
import pulse from './pulse'
import noise from './noise'
import brownNoise from './brownNoise'
import drum from './drum'

export default {
  id: 'centralBankAlert',
  length: 44.137,
  loop: true,
  tracks: {
    triangle,
    sine: triangle,
    square: pulse,
    pulse: square,
    noise,
    brownNoise,
    drum
  },
  init: SNDTRCK => {
    SNDTRCK.devices.squareSynth.envelope.attack = .005
    SNDTRCK.devices.squareSynth.envelope.decay = .005
    SNDTRCK.devices.squareSynth.envelope.sustain = .3
    SNDTRCK.devices.squareSynth.envelope.release = 2
    SNDTRCK.devices.pulseSynth.envelope.attack = 0.005
    SNDTRCK.devices.pulseSynth.envelope.decay = .005
    SNDTRCK.devices.pulseSynth.envelope.sustain = .8
    SNDTRCK.devices.pulseSynth.envelope.release = .2

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