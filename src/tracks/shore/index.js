// Czino - Shore

import noise from './noise'
import brownNoise from './brownNoise'

export default {
  id: 'shore',
  length: 21,
  loop: true,
  tracks: {
    noise,
    brownNoise
  },
  init: SNDTRCK => {
    SNDTRCK.devices.noiseSynth.envelope.attack = 2.189
    SNDTRCK.devices.noiseSynth.envelope.sustain = 1
    SNDTRCK.devices.noiseSynth.envelope.release = 9
    SNDTRCK.devices.brownNoiseSynth.envelope.attack = 3.389
    SNDTRCK.devices.brownNoiseSynth.envelope.sustain = 1
    SNDTRCK.devices.brownNoiseSynth.envelope.release = 11
  },
  deinit: SNDTRCK => {
    SNDTRCK.devices.noiseSynth.envelope.attack = 0.005
    SNDTRCK.devices.noiseSynth.envelope.release = 0.07
    SNDTRCK.devices.noiseSynth.envelope.sustain = 0
    SNDTRCK.devices.brownNoiseSynth.envelope.attack = 0.005
    SNDTRCK.devices.brownNoiseSynth.envelope.sustain = 0
    SNDTRCK.devices.brownNoiseSynth.envelope.release = 0.07
  }
}