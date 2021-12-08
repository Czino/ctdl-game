// Czino - Collapse

import triangle from './triangle'
import square from './square'
import sine from './sine'
import pulse from './pulse'
import pulse2 from './pulse2'
import drum from './drum'
import noise from './noise'
import brownNoise from './brownNoise'

export default {
  id: 'collapse',
  length: 288.722,
  loop: true,
  tracks: {
    triangle,
    square,
    sine,
    pulse,
    pulse2,
    drum,
    noise,
    brownNoise
  },
  reverbs: ['sineSynth'],
  lfo: ['sineSynth'],
  init: SNDTRCK => {
    SNDTRCK.devices.squareSynth.envelope.decay = .8
    SNDTRCK.devices.triangleSynth.envelope.attack = 0.5
    SNDTRCK.devices.triangleSynth.envelope.decay = 2.5
    SNDTRCK.devices.squareSynth.envelope.sustain = 0.2
    SNDTRCK.devices.triangleSynth.envelope.sustain = 0.2
    SNDTRCK.devices.sineSynth.envelope.sustain = 0.2
    SNDTRCK.devices.noiseSynth.envelope.release = 0
    SNDTRCK.devices.drumSynth.envelope.attack = 0
    SNDTRCK.devices.drumSynth.envelope.sustain = 1

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