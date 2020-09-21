import { Synth, NoiseSynth, Transport, Part, Gain, Reverb } from 'tone'
import bass1 from './tracks/stella-splendence/bass1'
import bass2 from './tracks/stella-splendence/bass2'
import flute1 from './tracks/stella-splendence/flute1'
import flute2 from './tracks/stella-splendence/flute2'
import sine from './tracks/stella-splendence/sine'
import lead from './tracks/game-over/lead'

import santaMariaNoise from './tracks/santa-maria/noise'
import santaMariaPulse from './tracks/santa-maria/pulse'
import santaMariaSine from './tracks/santa-maria/sine'

import mariamCello from './tracks/mariam-matrem-virginem/cello'
import mariamHarp from './tracks/mariam-matrem-virginem/harp'
import mariamPipe from './tracks/mariam-matrem-virginem/pipe'
import mariamStrings from './tracks/mariam-matrem-virginem/strings'
import mariamViola from './tracks/mariam-matrem-virginem/viola'
// import mariamViolin from './tracks/mariam-matrem-virginem/violin'

Transport.bpm.value = 136;

const gain = new Gain(0).toDestination()
const reverb = new Reverb({
  decay: 17,
  wet: 1
}).toDestination()

const pulseOptions = {
  oscillator: {
    type: 'pulse'
  },
  envelope: {
    release: 0.07
  }
};

const triangleOptions = {
  oscillator: {
    type: 'triangle'
  },
  envelope: {
    release: 0.07
  }
};

const squareOptions = {
  oscillator: {
    type: 'square'
  },
  envelope: {
    release: 0.07
  }
};

const sineOptions = {
  oscillator: {
    type: 'sine'
  },
  envelope: {
    sustain: .8,
    release: 0.8
  }
};

const pulseSynth = new Synth(pulseOptions).connect(gain).toDestination()
const pulse2Synth = new Synth(pulseOptions).connect(gain).toDestination()
const squareSynth = new Synth(squareOptions).connect(gain).toDestination()
const triangleSynth = new Synth(triangleOptions).connect(gain).toDestination()
const sineSynth = new Synth(sineOptions).connect(gain).toDestination()
const noiseSynth = new NoiseSynth().connect(gain).toDestination()

pulseSynth.volume.value = -19
pulse2Synth.volume.value = -19
squareSynth.volume.value = -19
triangleSynth.volume.value = -19
sineSynth.volume.value = -19
noiseSynth.volume.value = -19

const songs = {
    // Llibre Vermell de Montserrat. Mariam Matrem Virginem
    mariamMatremVirginem: {
      length: 200.97,
      bpm: 136,
      pulse: mariamStrings,
      pulse2: mariamViola,
      triangle: mariamCello,
      sine: mariamPipe,
      square: mariamHarp,
      // mariamViolin
      loop: true
    },
    // Llibre Vermell de Montserrat: Anonymous - Stella Splendece
    stellaSplendence: {
      length: 136.575,
      bpm: 136,
      noise: bass1,
      pulse: bass1,
      pulse2: bass2,
      triangle: flute1,
      sine: flute2,
      square: sine,
      loop: true
    },
    //Alfonso X, el Sabio (1221-1284) Spanish: Santa Maria Strela do dia
    santaMaria: {
      length: 79.7342,
      bpm: 90,
      noise: santaMariaNoise,
      triangle: santaMariaPulse,
      sine: santaMariaSine,
      sineReverb: true,
      loop: true
    },
    // Czino - I'm sad
    gameOver: {
      length: 16.97,
      bpm: 136,
      sine: lead,
      loop: false
    }
}
let enabled = true
let song

let pulsePart = new Part()
let pulse2Part = new Part()
let squarePart = new Part()
let trianglePart = new Part()
let sinePart = new Part()
let noisePart = new Part()

export const initSoundtrack = (id, enable) => {
  let wasEnabled = enable || enabled
  song = songs[id]

  if (Transport.state === 'started') stopMusic(true)

  if (song.sineReverb) {
    sineSynth.connect(reverb)
  } else {
    reverb.disconnect(sineSynth)
  }
  Transport.bpm.value = song.bpm;

  // pulsePart.removeAll()
  // squarePart.removeAll()
  // trianglePart.removeAll()
  // sinePart.removeAll()
  // noisePart.removeAll()

  if (song.pulse) {
    pulsePart = new Part((time, note) => {
      pulseSynth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
    }, parseNotes(song.pulse))
  }
  if (song.pulse2) {
    pulse2Part = new Part((time, note) => {
      pulse2Synth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
    }, parseNotes(song.pulse2))
  }

  if (song.square) {
    squarePart = new Part((time, note) => {
      squareSynth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
    }, parseNotes(song.square))
  }

  if (song.triangle) {
    trianglePart = new Part((time, note) => {
      triangleSynth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
    }, parseNotes(song.triangle))
  }

  if (song.sine) {
    sinePart = new Part((time, note) => {
      sineSynth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
    }, parseNotes(song.sine))
  }

  if (song.noise) {
    noisePart = new Part((time, note) => {
      noiseSynth.triggerAttackRelease(note.duration, time, note.velocity)
    }, parseNotes(song.noise))
  }

  if (wasEnabled) startMusic(wasEnabled)
}

export const startMusic = async enable => {
  if (typeof enable !== 'undefined') enabled = enable

  await Transport.start('+0.1', 0)
  if (song.pulse) pulsePart.start(0)
  if (song.pulse2) pulse2Part.start(0)
  if (song.square) squarePart.start(0)
  if (song.triangle) trianglePart.start(0)
  if (song.sine) sinePart.start(0)
  if (song.noise) noisePart.start(0)

  Transport.stop('+' + song.length);
}

export const stopMusic = disable => {
  if (typeof disable !== 'undefined') enabled = !disable
  Transport.stop()
  if (song.pulse) pulsePart.stop(0)
  if (song.pulse2) pulse2Part.stop(0)
  if (song.square) squarePart.stop(0)
  if (song.triangle) trianglePart.stop(0)
  if (song.sine) sinePart.stop(0)
  if (song.noise) noisePart.stop(0)
}

export const changeVolume = value => {
  gain.gain.rampTo(value - 1, 0);
}

Transport.on('stop', () => {
  if (song.loop && enabled) startMusic()
})

function parseNotes(notes) {
  return notes.map(note => ({
    'time': note[0],
    'duration': note[1],
    'name': note[2],
    'velocity': note[3]
  }))
}

window.initSoundtrack = initSoundtrack
window.startMusic = startMusic
window.Transport = Transport