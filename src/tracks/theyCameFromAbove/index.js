// Jim Reaper - They Came From Above (8-bit version)

import square from './square'
import sine from './sine'
import triangle from './triangle'
import pulse from './pulse'
import pulse2 from './pulse2'
import noise from './noise'
import brownNoise from './brownNoise'
import drum from './drum'

export default {
  id: 'theyCameFromAbove',
  length: 120 + 44.571,
  loop: false,
  tracks: {
    square,
    sine,
    triangle,
    pulse,
    pulse2,
    noise,
    brownNoise,
    drum
  },
  reverbs: [
    'sineSynth',
    'pulse2Synth'
  ],
  bpm: 140,
  delay: 0.510,
  delayFeedback: .4,
  delays: [
    'pulseSynth'
  ],
  lfo: [
    'sineSynth'
  ],
  init: SNDTRCK => {
    SNDTRCK.devices.squareSynth.envelope.attack = 0
    SNDTRCK.devices.squareSynth.envelope.decay = 3.800
    SNDTRCK.devices.squareSynth.envelope.sustain = 0
    SNDTRCK.devices.squareSynth.envelope.release = .4

    SNDTRCK.devices.sineSynth.envelope.attack = 0
    SNDTRCK.devices.sineSynth.envelope.decay = 1.000
    SNDTRCK.devices.sineSynth.envelope.sustain = 0
    SNDTRCK.devices.sineSynth.envelope.release = .4

    SNDTRCK.devices.triangleSynth.envelope.attack = .086
    SNDTRCK.devices.triangleSynth.envelope.decay = 1.000
    SNDTRCK.devices.triangleSynth.envelope.sustain = 0
    SNDTRCK.devices.triangleSynth.envelope.release = 1.300
  }
}