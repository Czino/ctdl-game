// Vlad Costea - Bulls vs Bears (Czino 8-bit remix)

import triangle from './triangle'
import sine from './sine'
import pulse1 from './pulse1'
import pulse2 from './pulse2'

export default {
  id: 'bullsVsBears',
  length: 26.182,
  reverbs: [
    'sineSynth',
    'pulseSynth',
    'pulse2Synth'
  ],
  loop: true,
  tracks: {
    noise: triangle,
    triangle: triangle,
    pulse: pulse1,
    pulse2: pulse2,
    sine: sine
  }
}