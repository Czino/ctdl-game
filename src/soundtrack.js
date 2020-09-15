import { Synth, NoiseSynth, Transport, Part, Gain } from 'tone'
import bass1 from './tracks/stella-splendence/bass1'
import bass2 from './tracks/stella-splendence/bass2'
import flute1 from './tracks/stella-splendence/flute1'
import flute2 from './tracks/stella-splendence/flute2'
import sine from './tracks/stella-splendence/sine'
import lead from './tracks/game-over/lead'

Transport.bpm.value = 136;

const gain = new Gain(0).toDestination()

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

const pulseSynth = new Synth(pulseOptions).connect(gain).toMaster()
const pulse2Synth = new Synth(pulseOptions).connect(gain).toMaster()
const squareSynth = new Synth(squareOptions).connect(gain).toMaster()
const triangleSynth = new Synth(triangleOptions).connect(gain).toMaster()
const sineSynth = new Synth(sineOptions).connect(gain).toMaster()
const noiseSynth = new NoiseSynth().connect(gain).toMaster()

const songs = {
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

export const initSoundtrack = id => {
  song = songs[id]

  Transport.bpm.value = song.bpm;

  // pulsePart.removeAll()
  // squarePart.removeAll()
  // trianglePart.removeAll()
  // sinePart.removeAll()
  // noisePart.removeAll()

  if (song.pulse != null) {
    pulsePart = new Part((time, note) => {

      pulseSynth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
    }, parseNotes(song.pulse))
  }
  if (song.pulse2 != null) {
    pulse2Part = new Part((time, note) => {
      pulse2Synth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
    }, parseNotes(song.pulse2))
  }

  if (song.square != null) {
    squarePart = new Part((time, note) => {
      squareSynth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
    }, parseNotes(song.square))
  }

  if (song.triangle != null) {
    trianglePart = new Part((time, note) => {
      triangleSynth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
    }, parseNotes(song.triangle))
  }

  if (song.sine != null) {
    sinePart = new Part((time, note) => {
      sineSynth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
    }, parseNotes(song.sine))
  }

  if (song.noise != null) {
    noisePart = new Part((time, note) => {
      noiseSynth.triggerAttackRelease(note.duration, time, note.velocity)
    }, parseNotes(song.noise))
  }
}

export const start = enable => {
  if (typeof enable !== 'undefined') enabled = enable
  Transport.start('+0.1', 0)
  if (song.pulse != null) pulsePart.start(0)
  if (song.pulse2 != null) pulse2Part.start(0)
  if (song.square != null) squarePart.start(0)
  if (song.triangle != null) trianglePart.start(0)
  if (song.sine != null) sinePart.start(0)
  if (song.noise != null) noisePart.start(0)

  Transport.stop('+' + song.length);
}

export const stop = disable => {
  if (typeof disable !== 'undefined') enabled = !disable
  Transport.stop()
  if (song.pulse != null) pulsePart.stop(0)
  if (song.pulse2 != null) pulse2Part.stop(0)
  if (song.square != null) squarePart.stop(0)
  if (song.triangle != null) trianglePart.stop(0)
  if (song.sine != null) sinePart.stop(0)
  if (song.noise != null) noisePart.stop(0)
}

export const changeVolume = value => {
  gain.gain.rampTo(value - 1, 0);
}

Transport.on('stop', () => {
  if (song.loop && enabled) start()
})

function parseNotes(notes) {
  return notes.map(note => ({
    'time': note[0],
    'duration': note[1],
    'name': note[2],
    'velocity': note[3]
  }))
}