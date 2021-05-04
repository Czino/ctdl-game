// Czino - Le Fleuve Glacè

import square from './square'
import sine from './sine'
import pulse from './pulse'
import drum from './drum'
import noise from './noise'
import brownNoise from './brownNoise'

export default {
  id: 'leFleuveGlace',
  length: 103.784,
  loop: true,
  tracks: {
    square,
    sine,
    triangle: pulse,
    drum,
    noise: noise.concat(drum),
    brownNoise
  },
  init: SNDTRCK => {
    SNDTRCK.devices.sineSynth.envelope.attack = 6
    SNDTRCK.devices.sineSynth.envelope.release = 16
    SNDTRCK.devices.squareSynth.envelope.release = 16
    SNDTRCK.devices.triangleSynth.envelope.release = 16
    SNDTRCK.devices.noiseSynth.envelope.release = 16
    SNDTRCK.devices.brownNoiseSynth.envelope.release = 16
    SNDTRCK.devices.drumSynth.envelope.release = 4
  }
}