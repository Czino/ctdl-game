import { Synth, NoiseSynth, Transport, AutoFilter, Part, Gain, Reverb, PingPongDelay } from 'tone'

// TODO add "Nomen a solempnibus II" ?
// TODO add "Procurans odium II" ?
// TODO add "Guillaume de Machaut - Douce Dame Jolie" ?


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

window.SNDTRCK = {
  constructor: {
    AutoFilter,
    Gain,
    Reverb
  },
  devices: {
    gain: new Gain(1).toDestination(),
    reverb: new Reverb({
      decay: 17,
      wet: .5,
    }),
    delay: null,
    autoFilter: null,
    autoFilter2: null,
    pulseSynth: new Synth(pulseOptions),
    pulse2Synth: new Synth(pulseOptions),
    squareSynth: new Synth(squareOptions),
    triangleSynth: new Synth(triangleOptions),
    sineSynth: new Synth(sineOptions),
    drumSynth: new Synth(sineOptions),
    noiseSynth: new NoiseSynth(),
    brownNoiseSynth: new NoiseSynth()
  },
}


window.SNDTRCK.devices.drumSynth.portamento = .1
window.SNDTRCK.devices.brownNoiseSynth.noise.type = 'brown'

window.SNDTRCK.synths = [
  window.SNDTRCK.devices.pulseSynth,
  window.SNDTRCK.devices.pulse2Synth,
  window.SNDTRCK.devices.squareSynth,
  window.SNDTRCK.devices.triangleSynth,
  window.SNDTRCK.devices.sineSynth,
  window.SNDTRCK.devices.drumSynth,
  window.SNDTRCK.devices.noiseSynth,
  window.SNDTRCK.devices.brownNoiseSynth
]

window.SNDTRCK.synths .map(synth => synth.volume.value = -19)

let enabled

let pulsePart = new Part()
let pulse2Part = new Part()
let squarePart = new Part()
let trianglePart = new Part()
let sinePart = new Part()
let noisePart = new Part()
let brownNoisePart = new Part()
let drumPart = new Part()


export const initSoundtrack = async id => {
  if (window.SNDTRCK.song?.deinit) window.SNDTRCK.song.deinit()

  let song = await fetch(`/tracks/${id}.js`)
  eval(await song.text())

  if (Transport.state === 'started') stopMusic()

  if (pulsePart) pulsePart.remove()
  if (pulse2Part) pulse2Part.remove()
  if (sinePart) sinePart.remove()
  if (trianglePart) trianglePart.remove()
  if (noisePart) noisePart.remove()
  if (brownNoisePart) brownNoisePart.remove()

  window.SNDTRCK.synths.map(synth =>
    synth.disconnect() && synth.connect(window.SNDTRCK.devices.gain)
  )
  if (window.SNDTRCK.song.reverbs) {
    window.SNDTRCK.song.reverbs.map(synth => {
      synth.disconnect()
      synth.chain(
        window.SNDTRCK.devices.reverb,
        window.SNDTRCK.devices.gain)
    })
  }
  if (window.SNDTRCK.song.delays) {
    window.SNDTRCK.devices.delay = new PingPongDelay(
      60 / window.SNDTRCK.song.bpm * window.SNDTRCK.song.delay,
      window.SNDTRCK.song.delayFeedback
    )
    window.SNDTRCK.song.delays.map(synth => {
      synth.chain(
        window.SNDTRCK.devices.delay,
        window.SNDTRCK.devices.gain
      )
    })
  }

  if (window.SNDTRCK.song.init) window.SNDTRCK.song.init()

  Transport.loop = window.SNDTRCK.song.loop
  Transport.loopStart = 0
  Transport.loopEnd = window.SNDTRCK.song.length

  if (window.SNDTRCK.song.tracks.pulse) {
    pulsePart = new Part((time, note) => {
      window.SNDTRCK.devices.pulseSynth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
    }, parseNotes(window.SNDTRCK.song.tracks.pulse))
  }
  if (window.SNDTRCK.song.tracks.pulse2) {
    pulse2Part = new Part((time, note) => {
      window.SNDTRCK.devices.pulse2Synth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
    }, parseNotes(window.SNDTRCK.song.tracks.pulse2))
  }

  if (window.SNDTRCK.song.tracks.square) {
    squarePart = new Part((time, note) => {
      window.SNDTRCK.devices.squareSynth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
    }, parseNotes(window.SNDTRCK.song.tracks.square))
  }

  if (window.SNDTRCK.song.tracks.triangle) {
    trianglePart = new Part((time, note) => {
      window.SNDTRCK.devices.triangleSynth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
    }, parseNotes(window.SNDTRCK.song.tracks.triangle))
  }

  if (window.SNDTRCK.song.tracks.sine) {
    sinePart = new Part((time, note) => {
      window.SNDTRCK.devices.sineSynth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
    }, parseNotes(window.SNDTRCK.song.tracks.sine))
  }

  if (window.SNDTRCK.song.tracks.noise) {
    noisePart = new Part((time, note) => {
      window.SNDTRCK.devices.noiseSynth.triggerAttackRelease(note.duration, time, note.velocity)
    }, parseNotes(window.SNDTRCK.song.tracks.noise))
  }
  if (window.SNDTRCK.song.tracks.brownNoise) {
    brownNoisePart = new Part((time, note) => {
      window.SNDTRCK.devices.brownNoiseSynth.triggerAttackRelease(note.duration, time, note.velocity)
    }, parseNotes(window.SNDTRCK.song.tracks.brownNoise))
  }
  if (window.SNDTRCK.song.tracks.drum) {
    drumPart = new Part((time, note) => {
      window.SNDTRCK.devices.drumSynth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
      window.SNDTRCK.devices.drumSynth.triggerAttackRelease('D1', note.duration, time + 0.01, note.velocity)
      window.SNDTRCK.devices.brownNoiseSynth.triggerAttackRelease(note.duration, time, note.velocity)
    }, parseNotes(window.SNDTRCK.song.tracks.drum))
  }

  if (enabled) startMusic()
}

window.initSoundtrack = initSoundtrack


export const getSoundtrack = () => window.SNDTRCK.song?.id

export const toggleSoundtrack = enable => {
  enabled = enable
  if (!enabled) {
    stopMusic()
  } else if (enabled && window.SNDTRCK.song) {
    startMusic()
  }
}

export const startMusic = async () => {
  if (!window.SNDTRCK.song || !enabled) return

  await Transport.start('+0.1', 0)
  if (window.SNDTRCK.song.tracks.pulse) pulsePart.start(0)
  if (window.SNDTRCK.song.tracks.pulse2) pulse2Part.start(0)
  if (window.SNDTRCK.song.tracks.square) squarePart.start(0)
  if (window.SNDTRCK.song.tracks.triangle) trianglePart.start(0)
  if (window.SNDTRCK.song.tracks.sine) sinePart.start(0)
  if (window.SNDTRCK.song.tracks.noise) noisePart.start(0)
  if (window.SNDTRCK.song.tracks.brownNoise) brownNoisePart.start(0)
  if (window.SNDTRCK.song.tracks.drum) drumPart.start(0)
}

export const stopMusic = () => {
  if (!window.SNDTRCK.song) return

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
  window.SNDTRCK.devices.gain.gain.rampTo(value, 0)
}

function parseNotes(notes) {
  return notes.map(note => ({
    time: note[0],
    duration: note[1],
    name: note[2],
    velocity: note[3]
  }))
}