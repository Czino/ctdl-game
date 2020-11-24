import { Synth, NoiseSynth, Transport, AutoFilter, Part, Gain, Reverb, PingPongDelay } from 'tone'

import mariamMatremVirginem from './tracks/mariam-matrem-virginem'
import imperayritzDeLaCiutatIoyosa from './tracks/imperayritz-de-la-ciutat-ioyosa'
import briansTheme from './tracks/brians-theme'
import stellaSplendence from './tracks/stella-splendence'
import gameOver from './tracks/game-over'
import santaMaria from './tracks/santa-maria'
import bear from './tracks/bear'
import bullsVsBears from './tracks/bulls-vs-bears'
import aNewHope from './tracks/a-new-hope'
import darkIsBetter from './tracks/dark-is-better'
import endOfTheRabbitHole from './tracks/end-of-the-rabbit-hole'
import miningFarm from './tracks/mining-farm'
import citadelUnderAttack from './tracks/citadel-under-attack'

// TODO add "Nomen a solempnibus II" ?
// TODO add "Procurans odium II" ?
// TODO add "Guillaume de Machaut - Douce Dame Jolie" ?
const gain = new Gain(1).toDestination()
const reverb = new Reverb({
  decay: 17,
  wet: .5,
})
let delay

let autoFilter
let autoFilter2

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
const drumSynth = new Synth(sineOptions)
const noiseSynth = new NoiseSynth()
const brownNoiseSynth = new NoiseSynth()
drumSynth.portamento = .1

const synths = [
  pulseSynth,
  pulse2Synth,
  squareSynth,
  triangleSynth,
  sineSynth,
  drumSynth,
  noiseSynth,
  brownNoiseSynth
]

synths.map(synth => synth.volume.value = -19)

brownNoiseSynth.noise.type = 'brown'

const songs = {
    // Llibre Vermell de Montserrat: Anonymous - Mariam Matrem Virginem
    mariamMatremVirginem: {
      id: 'mariamMatremVirginem',
      length: 200.97,
      pulse: mariamMatremVirginem.strings,
      pulse2: mariamMatremVirginem.viola,
      triangle: mariamMatremVirginem.cello,
      sine: mariamMatremVirginem.pipe,
      square: mariamMatremVirginem.harp,
      loop: false
    },
    // Czino - Brian's theme
    briansTheme: {
      id: 'briansTheme',
      length: 31.8333 + 0.1667,
      noise: briansTheme.noise,
      pulse: briansTheme.pulse1,
      triangle: briansTheme.triangle,
      loop: true
    },
    // Llibre Vermell de Montserrat: Anonymous - Stella Splendece
    stellaSplendence: {
      id: 'stellaSplendence',
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
      id: 'imperayritzDeLaCiutatIoyosa',
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
      id: 'santaMaria',
      length: 79.7342,
      noise: santaMaria.noise,
      triangle: santaMaria.pulse,
      sine: santaMaria.sine,
      reverbs: [ sineSynth ],
      loop: true
    },
    // Czino - Bear
    bear: {
      id: 'bear',
      length: 24.8182 + 1.3636,
      brownNoise: bear.triangle,
      pulse: bear.pulse1,
      triangle: bear.triangle,
      sine: bear.sine,
      noise: bear.noise,
      init: () => {
        autoFilter = new AutoFilter(1 / 1.3636)
        sineSynth.envelope.attack = 0.0
        sineSynth.envelope.release = 1.36
        sineSynth.disconnect()
        sineSynth.chain(autoFilter, reverb, gain)
        autoFilter.start()

        noiseSynth.noise.type = 'pink'
      },
      deinit: () => {
        sineSynth.envelope.attack = 0.005
        sineSynth.envelope.release = 0.8
        autoFilter.stop()

        noiseSynth.noise.type = 'white'
      },
      loop: true
    },
    // Vlad Costea - Bulls vs Bears (Czino 8-bit remix)
    bullsVsBears: {
      id: 'bullsVsBears',
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
      id: 'aNewHope',
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
    // Vlad Costea - Darker is Better (Czino 8-bit remix)
    darkIsBetter: {
      id: 'darkIsBetter',
      length: 104,
      bpm: 120,
      delay: 0.255,
      delayFeedback: .8,
      square: darkIsBetter.pulse1,
      pulse: darkIsBetter.pulse1,
      pulse2: darkIsBetter.pulse2,
      sine: darkIsBetter.sine,
      delays: [ sineSynth, squareSynth, pulseSynth, pulse2Synth ],
      loop: true
    },
    endOfTheRabbitHole: {
      id: 'endOfTheRabbitHole',
      length: 7.559,
      bpm: 127,
      delay: 0.25,
      drum: endOfTheRabbitHole.drum,
      brownNoise: endOfTheRabbitHole.noise,
      triangle: endOfTheRabbitHole.pulse1,
      square: endOfTheRabbitHole.square,
      pulse: endOfTheRabbitHole.triangle,
      sine: endOfTheRabbitHole.sine,
      delays: [ sineSynth ],
      loop: true
    },
    // Czino - Mining Farm
    miningFarm: {
      id: 'miningFarm',
      length: 1,
      bpm: 127,
      noise: miningFarm.noise,
      triangle: miningFarm.triangle,
      pulse: miningFarm.pulse1,
      sine: miningFarm.sine,
      reverbs: [ sineSynth ],
      loop: true,
      init: () => {
        autoFilter = new AutoFilter(.01)
        autoFilter2 = new AutoFilter(.015)
        noiseSynth.envelope.attack = 0
        noiseSynth.envelope.sustain = 1

        pulseSynth.envelope.attack = 0
        pulseSynth.envelope.sustain = 1
        pulseSynth.envelope.release = 0

        triangleSynth.envelope.attack = 0
        triangleSynth.envelope.sustain = 1
        triangleSynth.envelope.release = 0

        sineSynth.envelope.attack = .5
        sineSynth.envelope.release = .5

        pulseSynth.disconnect()
        pulseSynth.chain(autoFilter, gain)
        autoFilter.start()

        triangleSynth.disconnect()
        triangleSynth.chain(autoFilter2, gain)
        autoFilter2.start()
      },
      deinit: () => {
        pulseSynth.envelope.attack = 0.005
        pulseSynth.envelope.release = 0.8
        triangleSynth.envelope.attack = 0.005
        triangleSynth.envelope.release = 0.8
        sineSynth.envelope.attack = 0.005
        sineSynth.envelope.release = 0.8
        autoFilter.stop()
        autoFilter2.stop()

        noiseSynth.noise.type = 'white'
      },
    },
    // Czino - Citadel Under Attack
    citadelUnderAttack: {
      id: 'citadelUnderAttack',
      length: 37.333,
      bpm: 127,
      noise: citadelUnderAttack.noise,
      triangle: citadelUnderAttack.triangle,
      square: citadelUnderAttack.square,
      pulse: citadelUnderAttack.pulse1,
      pulse2: citadelUnderAttack.pulse2,
      sine: citadelUnderAttack.sine,
      reverbs: [ sineSynth ],
      loop: true,
      init: () => {
        autoFilter = new AutoFilter(.01)
        autoFilter2 = new AutoFilter(.015)
        noiseSynth.envelope.attack = 0
        noiseSynth.envelope.sustain = 1

        pulseSynth.envelope.attack = 0
        pulseSynth.envelope.sustain = 1
        pulseSynth.envelope.release = 0
        pulse2Synth.envelope.attack = 0
        pulse2Synth.envelope.sustain = 1
        pulse2Synth.envelope.release = 0

        triangleSynth.envelope.attack = 0
        triangleSynth.envelope.sustain = 1
        triangleSynth.envelope.release = 0

        sineSynth.envelope.attack = .5
        sineSynth.envelope.release = .5

        pulseSynth.disconnect()
        pulseSynth.chain(autoFilter, gain)
        pulse2Synth.disconnect()
        pulse2Synth.chain(autoFilter, gain)
        autoFilter.start()

        triangleSynth.disconnect()
        triangleSynth.chain(autoFilter2, gain)
        squareSynth.disconnect()
        squareSynth.chain(autoFilter2, gain)
        autoFilter2.start()
      },
      deinit: () => {
        pulseSynth.envelope.attack = 0.005
        pulseSynth.envelope.release = 0.8
        triangleSynth.envelope.attack = 0.005
        triangleSynth.envelope.release = 0.8
        sineSynth.envelope.attack = 0.005
        sineSynth.envelope.release = 0.8
        autoFilter.stop()
        autoFilter2.stop()

        noiseSynth.noise.type = 'white'
      },
    },
    // Czino - I'm sad
    gameOver: {
      id: 'gameOver',
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
let drumPart = new Part()

export const initSoundtrack = id => {
  if (song?.deinit) song.deinit()

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
  if (song.delays) {
    delay = new PingPongDelay(
      60 / song.bpm * song.delay,
      song.delayFeedback
    )
    song.delays.map(synth => {
      synth.chain(delay, gain)
    })
  }

  if (song.init) song.init()

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
  if (song.drum) {
    drumPart = new Part((time, note) => {
      drumSynth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
      drumSynth.triggerAttackRelease('D1', note.duration, time + 0.01, note.velocity)
      brownNoiseSynth.triggerAttackRelease(note.duration, time, note.velocity)
    }, parseNotes(song.drum))
  }

  if (enabled) startMusic()
}

export const getSoundtrack = () => song?.id

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
  if (song.drum) drumPart.start(0)
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
  if (drumPart) drumPart.stop(0)
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