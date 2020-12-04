// Llibre Vermell de Montserrat: Anonymous - Stella Splendece

import bass1 from './bass1'
import bass2 from './bass2'
import flute1 from './flute1'
import flute2 from './flute2'
import sine from './sine'

export default {
  id: 'stellaSplendence',
  length: 136.575,
  loop: true,
  tracks: {
    noise: bass1,
    pulse: bass1,
    pulse2: bass2,
    triangle: flute1,
    sine: flute2,
    square: sine
  }
}