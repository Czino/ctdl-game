// Czino - Capital City

import square from './square'
import triangle from './triangle'
import sine from './sine'
import pulse from './pulse'
import pulse2 from './pulse2'
import noise from './noise'
import brownNoise from './brownNoise'
import drum from './drum'

export default {
  id: 'moon',
  length: 60 + 22.285,
  loop: true,
  tracks: {
    square,
    triangle,
    sine,
    pulse,
    pulse2,
    noise,
    brownNoise,
    drum
  },
  reverbs: ['sineSynth', 'pulse2Synth'],
  lfo: ['pulseSynth', 'pulse2Synth'],
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
    SNDTRCK.devices.noiseSynth.envelope.release = .8
    SNDTRCK.devices.autoFilter.stop()
  }
}