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
  tracks: {
    triangle,
    square,
    sine,
    pulse,
  }
}