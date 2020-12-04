// Rotamola - Back 2 Bassiks (Czino 8-bit Remix)
import triangle from './triangle'
import sine from './sine'
import pulse1 from './pulse1'
import noise from './noise'
import drum from './drum'

export default {
  id: 'endOfTheRabbitHole',
  length: 7.559,
  bpm: 127,
  delay: 0.25,
  delays: ['sineSynth'],
  loop: true,
  tracks: {
    drum: drum,
    brownNoise: noise,
    triangle: pulse1,
    pulse: triangle,
    sine: sine
  }
}