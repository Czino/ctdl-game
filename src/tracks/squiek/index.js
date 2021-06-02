// Czino - Squiek

import triangle from './triangle'
import square from './square'
import sine from './sine'
import pulse from './pulse'

export default {
  id: 'squiek',
  length: 30.240,
  loop: true,
  bpm: 125,
  delay: 0.48,
  delayFeedback: .6,
  delays: [
    'triangleSynth',
    'squareSynth',
    'sineSynth'
  ],
  lfo: ['squareSynth'],
  tracks: {
    triangle,
    square,
    sine,
    pulse
  },
  init: SNDTRCK => {
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