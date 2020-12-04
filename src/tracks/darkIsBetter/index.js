// Vlad Costea - Darker is Better (Czino 8-bit remix)

import sine from './sine'
import pulse1 from './pulse1'
import pulse2 from './pulse2'

export default {
  id: 'darkIsBetter',
  length: 104,
  bpm: 120,
  delay: 0.255,
  delayFeedback: .8,
  delays: [
    'sineSynth',
    'squareSynth',
    'pulseSynth',
    'pulse2Synth'
  ],
  loop: true,
  tracks: {
    square: pulse1,
    pulse: pulse1,
    pulse2: pulse2,
    sine: sine
  }
}