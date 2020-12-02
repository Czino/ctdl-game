// Vlad Costea - Darker is Better (Czino 8-bit remix)

import sine from './sine'
import pulse1 from './pulse1'
import pulse2 from './pulse2'

export default {
  pulse1,
  pulse2,
  sine,
}

window.SNDTRCK.song = {
  id: 'darkIsBetter',
  length: 104,
  bpm: 120,
  delay: 0.255,
  delayFeedback: .8,
  delays: [
    window.SNDTRCK.devices.sineSynth,
    window.SNDTRCK.devices.squareSynth,
    window.SNDTRCK.devices.pulseSynth,
    window.SNDTRCK.devices.pulse2Synth
  ],
  loop: true,
  tracks: {
    square: pulse1,
    pulse: pulse1,
    pulse2: pulse2,
    sine: sine
  }
}