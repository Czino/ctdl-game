// BTC Minstrel - The Ballad of Surfer Jim (Czino 8-bit version)

import square from './square'
import triangle from './triangle'
import pulse from './pulse'
import pulse2 from './pulse2'
import noise from './noise'
import brownNoise from './brownNoise'
import event from './event'

export default {
  id: 'surferJim',
  length: 60 + 33.250,
  loop: true,
  tracks: {
    square,
    triangle,
    pulse,
    pulse2,
    noise,
    brownNoise,
    event
  },
  init: SNDTRCK => {
    SNDTRCK.devices.squareSynth.envelope.attack = .03
    SNDTRCK.devices.triangleSynth.envelope.attack = .03
    SNDTRCK.devices.pulseSynth.envelope.attack = .03
    SNDTRCK.devices.pulse2Synth.envelope.attack = .03
    SNDTRCK.devices.noiseSynth.envelope.attack = 2.189
    SNDTRCK.devices.noiseSynth.envelope.sustain = 1
    SNDTRCK.devices.noiseSynth.envelope.release = 9
    SNDTRCK.devices.brownNoiseSynth.envelope.attack = 3.389
    SNDTRCK.devices.brownNoiseSynth.envelope.sustain = 1
    SNDTRCK.devices.brownNoiseSynth.envelope.release = 11
  }
}