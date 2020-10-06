import { Synth, NoiseSynth, Transport, Part, Gain, Reverb } from 'tone'

import mariamMatremVirginem from './tracks/mariam-matrem-virginem'
import stellaSplendence from './tracks/stella-splendence/'
import gameOver from './tracks/game-over/'
import santaMaria from './tracks/santa-maria/'
import bullsVsBears from './tracks/bulls-vs-bears/'
import aNewHope from './tracks/a-new-hope'
import imperayritzDeLaCiutatIoyosa from './tracks/imperayritz-de-la-ciutat-ioyosa'

const gain = new Gain(1).toDestination()
const reverb = new Reverb({
  decay: 17,
  wet: .5,
})

const pulseOptions = {
  oscillator: {
    type: 'pulse'
  },
  envelope: {
    release: 0.07
  }
}

const triangleOptions = {
  oscillator: {
    type: 'triangle'
  },
  envelope: {
    release: 0.07
  }
}

const squareOptions = {
  oscillator: {
    type: 'square'
  },
  envelope: {
    release: 0.07
  }
}

const sineOptions = {
  oscillator: {
    type: 'sine'
  },
  envelope: {
    sustain: .8,
    release: 0.8
  }
}

const pulseSynth = new Synth(pulseOptions)
const pulse2Synth = new Synth(pulseOptions)
const squareSynth = new Synth(squareOptions)
const triangleSynth = new Synth(triangleOptions)
const sineSynth = new Synth(sineOptions)
const noiseSynth = new NoiseSynth()
const brownNoiseSynth = new NoiseSynth()

const synths = [
  pulseSynth,
  pulse2Synth,
  squareSynth,
  triangleSynth,
  sineSynth,
  noiseSynth,
  brownNoiseSynth
]

synths.map(synth => synth.volume.value = -19)

brownNoiseSynth.noise.type = 'brown'

const songs = {
    // Llibre Vermell de Montserrat: Anonymous - Mariam Matrem Virginem
    mariamMatremVirginem: {
      length: 200.97,
      pulse: mariamMatremVirginem.strings,
      pulse2: mariamMatremVirginem.viola,
      triangle: mariamMatremVirginem.cello,
      sine: mariamMatremVirginem.pipe,
      square: mariamMatremVirginem.harp,
      loop: true
    },
    // Llibre Vermell de Montserrat: Anonymous - Stella Splendece
    stellaSplendence: {
      length: 136.575,
      noise: stellaSplendence.bass1,
      pulse: stellaSplendence.bass1,
      pulse2: stellaSplendence.bass2,
      triangle: stellaSplendence.flute1,
      sine: stellaSplendence.flute2,
      square: stellaSplendence.sine,
      loop: true
    },
    // Llibre Vermell de Montserrat: Anonymous - Imperayritz De La Ciutat Ioyosa
    imperayritzDeLaCiutatIoyosa: {
      length: 190.7624,
      brownNoise: imperayritzDeLaCiutatIoyosa.drum,
      noise: imperayritzDeLaCiutatIoyosa.noise,
      triangle: imperayritzDeLaCiutatIoyosa.pulse1,
      square: imperayritzDeLaCiutatIoyosa.square,
      pulse: imperayritzDeLaCiutatIoyosa.triangle,
      sine: imperayritzDeLaCiutatIoyosa.sine,
      loop: true
    },
    // Alfonso X, el Sabio (1221-1284) Spanish: Santa Maria Strela do dia
    santaMaria: {
      length: 79.7342,
      noise: santaMaria.noise,
      triangle: santaMaria.pulse,
      sine: santaMaria.sine,
      reverbs: [ sineSynth ],
      loop: true
    },
    // Vlad Costea - Bulls vs Bears (Czino 8-bit remix)
    bullsVsBears: {
      length: 26.182,
      noise: bullsVsBears.triangle,
      triangle: bullsVsBears.triangle,
      pulse: bullsVsBears.pulse1,
      pulse2: bullsVsBears.pulse2,
      sine: bullsVsBears.sine,
      reverbs: [ sineSynth, pulseSynth, pulse2Synth ],
      loop: true
    },
    // Vlad Costea - A New Hope (Czino 8-bit remix)
    aNewHope: {
      length: 54.2608,
      noise: aNewHope.triangle,
      triangle: aNewHope.triangle,
      pulse: aNewHope.pulse1,
      pulse2: aNewHope.pulse2,
      sine: aNewHope.sine,
      square: aNewHope.sine,
      reverbs: [ sineSynth, pulseSynth, pulse2Synth ],
      loop: true
    },
    // Czino - I'm sad
    gameOver: {
      length: 20.00,
      sine: gameOver.melody,
      triangle: gameOver.rhythm,
      // reverbs: [ sineSynth ],
      loop: false
    }
}
let enabled
let song

let pulsePart = new Part()
let pulse2Part = new Part()
let squarePart = new Part()
let trianglePart = new Part()
let sinePart = new Part()
let noisePart = new Part()
let brownNoisePart = new Part()

export const initSoundtrack = id => {
  song = songs[id]

  if (Transport.state === 'started') stopMusic()

  if (pulsePart) pulsePart.remove()
  if (pulse2Part) pulse2Part.remove()
  if (sinePart) sinePart.remove()
  if (trianglePart) trianglePart.remove()
  if (noisePart) noisePart.remove()
  if (brownNoisePart) brownNoisePart.remove()

  synths.map(synth => synth.disconnect() && synth.connect(gain))
  if (song.reverbs) {
    song.reverbs.map(synth => {
      synth.disconnect()
      synth.chain(reverb, gain)
    })
  }

  Transport.loop = song.loop
  Transport.loopStart = 0
  Transport.loopEnd = song.length

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
  if (song.brownNoise) {
    brownNoisePart = new Part((time, note) => {
      brownNoiseSynth.triggerAttackRelease(note.duration, time, note.velocity)
    }, parseNotes(song.brownNoise))
  }

  if (enabled) startMusic()
}

export const toggleSoundtrack = enable => {
  enabled = enable
  if (!enabled) {
    stopMusic()
  } else if (enabled && song) {
    startMusic()
  }
}

export const startMusic = async () => {
  if (!song || !enabled) return

  await Transport.start('+0', 0)
  if (song.pulse) pulsePart.start(0)
  if (song.pulse2) pulse2Part.start(0)
  if (song.square) squarePart.start(0)
  if (song.triangle) trianglePart.start(0)
  if (song.sine) sinePart.start(0)
  if (song.noise) noisePart.start(0)
  if (song.brownNoise) brownNoisePart.start(0)
}

export const stopMusic = () => {
  if (!song) return

  Transport.stop()
  if (pulsePart) pulsePart.stop(0)
  if (pulse2Part) pulse2Part.stop(0)
  if (squarePart) squarePart.stop(0)
  if (trianglePart) trianglePart.stop(0)
  if (sinePart) sinePart.stop(0)
  if (noisePart) noisePart.stop(0)
  if (brownNoisePart) brownNoisePart.stop(0)
}

export const changeVolume = value => {
  gain.gain.rampTo(value, 0)
}

function parseNotes(notes) {
  return notes.map(note => ({
    time: note[0],
    duration: note[1],
    name: note[2],
    velocity: note[3]
  }))
}