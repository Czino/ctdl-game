// Llibre Vermell de Montserrat: Anonymous - Imperayritz De La Ciutat Ioyosa

import triangle from './triangle'
import sine from './sine'
import pulse1 from './pulse1'
import square from './square'
import noise from './noise'
import drum from './drum'

export default {
  triangle,
  pulse1,
  square,
  sine,
  noise,
  drum
}

window.SNDTRCK.song = {
  id: 'imperayritzDeLaCiutatIoyosa',
  length: 190.7624,
  loop: true,
  tracks: {
    brownNoise: drum,
    noise: noise,
    triangle: pulse1,
    square: square,
    pulse: triangle,
    sine: sine,
  }
}