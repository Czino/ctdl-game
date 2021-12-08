// Aphex Twin - Ageispolis (Czino 8-bit version)

import sine from './sine'

export default {
  id: 'ageispolis',
  length: 18.285,
  loop: true,
  tracks: {
    square: sine,
    sine: sine.map(note => {
      return [
        note[0],
        note[1],
        note[2].replace(/5/g, '6').replace(/4/g, '5'),
        .1
      ]
    })
  },
  reverbs: ['squareSynth', 'sineSynth'],
  init: SNDTRCK => {
    SNDTRCK.devices.squareSynth.envelope.attack = .005
    SNDTRCK.devices.squareSynth.envelope.decay = .005
    SNDTRCK.devices.squareSynth.envelope.sustain = .3
    SNDTRCK.devices.squareSynth.envelope.release = 2
    SNDTRCK.devices.sineSynth.envelope.attack = .005
    SNDTRCK.devices.sineSynth.envelope.decay = .005
    SNDTRCK.devices.sineSynth.envelope.sustain = .3
    SNDTRCK.devices.sineSynth.envelope.release = 2
    SNDTRCK.devices.squareSynth.set({
      detune: 40
    })
    SNDTRCK.devices.sineSynth.set({
      detune: 40
    })
  },
  deinit: SNDTRCK => {
    SNDTRCK.devices.squareSynth.set({
      detune: 0
    })
    SNDTRCK.devices.sineSynth.set({
      detune: 0
    })
  }
}