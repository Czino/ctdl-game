import { Synth, NoiseSynth, Gain, now } from 'tone'

const gain = new Gain(0).toDestination()

const pulseOptions = {
  oscillator: {
    type: 'pulse'
  },
  envelope: {
    release: 0
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
const noise2Synth = new NoiseSynth().connect(gain).toMaster()

let enabled = true

now()

const sounds = {
  'select': () => {
    const present = now()
    const dur = .1

    sineSynth.portamento = 0
    sineSynth.envelope.attack = .005
    sineSynth.envelope.decay = .1
    sineSynth.envelope.sustain = .3
    sineSynth.envelope.release = .07

    sineSynth.triggerAttack('A#3', present, .4)
    sineSynth.setNote('A#4', present + dur / 3, .4)
    sineSynth.triggerRelease(present + dur)
  },
  'playerHurt': () => {
    const present = now()
    const dur = .1

    noiseSynth.noise.type = 'pink'

    noiseSynth.envelope.attack = .005
    noiseSynth.envelope.decay = .1
    noiseSynth.envelope.sustain = .3
    noiseSynth.envelope.release = .07

    noiseSynth.triggerAttack(present, .3)
    noiseSynth.triggerRelease(present + dur)

    squareSynth.portamento = dur / 3
    squareSynth.envelope.attack = .005
    squareSynth.envelope.decay = .1
    squareSynth.envelope.sustain = .3
    squareSynth.envelope.release = .07

    squareSynth.triggerAttack('A#3', present + dur / 2, .2)
    squareSynth.setNote('G3', present + dur / 2 + dur / 3, .2)
    squareSynth.triggerRelease(present + dur / 2 + dur)
  },
  'item': () => {
    const present = now()
    const dur = .05

    sineSynth.portamento = 0
    sineSynth.envelope.attack = .005
    sineSynth.envelope.decay = .1
    sineSynth.envelope.sustain = .3
    sineSynth.envelope.release = .07

    sineSynth.triggerAttack('A#4', present, .2)
    sineSynth.setNote('G5', present + dur / 2, .2)
    sineSynth.triggerRelease(present + dur)
  },
  'block': () => {
    const present = now()
    const dur = .05

    noiseSynth.noise.type = 'brown'
    noiseSynth.envelope.attack = .005
    noiseSynth.envelope.decay = .1
    noiseSynth.envelope.sustain = .3
    noiseSynth.envelope.release = .07

    squareSynth.portamento = 0
    squareSynth.envelope.attack = .005
    squareSynth.envelope.decay = .1
    squareSynth.envelope.sustain = .3
    squareSynth.envelope.release = .07

    noiseSynth.triggerAttack(present, .2)
    noiseSynth.triggerRelease(present + dur)

    squareSynth.triggerAttack('B3', present + dur / 2, .02)
    squareSynth.triggerRelease(present + dur / 2 + dur)
  },
  'lightningTorch': () => {
    const present = now()
    const dur = .4

    noiseSynth.noise.type = 'white'

    noiseSynth.envelope.attack = .0005
    noiseSynth.envelope.decay = .0005
    noiseSynth.envelope.sustain = .3
    noiseSynth.envelope.release = .0005

    noiseSynth.triggerAttack(present, .02)
    noiseSynth.triggerRelease(present + dur)
  },
  'sword': () => {
    const present = now()
    const dur = .05

    noiseSynth.noise.type = 'pink'

    noiseSynth.envelope.attack = .05
    noiseSynth.envelope.decay = .1
    noiseSynth.envelope.sustain = .3
    noiseSynth.envelope.release = .17

    noiseSynth.triggerAttack(present, .1)
    noiseSynth.triggerRelease(present + dur)
  },
  'shitcoinerHurt': () => {
    const present = now()
    const dur = .05

    noise2Synth.noise.type = 'brown'

    noise2Synth.envelope.attack = .005
    noise2Synth.envelope.decay = .1
    noise2Synth.envelope.sustain = .3
    noise2Synth.envelope.release = .07

    noise2Synth.triggerAttack(present, .3)
    noise2Synth.triggerRelease(present + dur)

    pulseSynth.portamento = 0
    pulseSynth.envelope.attack = .005
    pulseSynth.envelope.decay = .1
    pulseSynth.envelope.sustain = .3
    pulseSynth.envelope.release = .07

    pulseSynth.triggerAttack('A#2', present + dur / 2, .05)
    pulseSynth.setNote('G1', present + dur / 2, .05)
    pulseSynth.triggerRelease(present + dur / 2 + dur)
  },
  'magic': () => {
    const noises = ['brown', 'brown', 'pink', 'white', 'brown', 'brown']
    const dur = .15
    let time = now()

    noiseSynth.envelope.attack = .4
    noiseSynth.envelope.decay = .1
    noiseSynth.envelope.sustain = .3
    noiseSynth.envelope.release = .07

    triangleSynth.portamento = 0
    triangleSynth.envelope.attack = .4
    triangleSynth.envelope.decay = .1
    triangleSynth.envelope.sustain = .3
    triangleSynth.envelope.release = .07

    triangleSynth.triggerAttack('C1', time, .2)
    noises.forEach(noise => {
      noiseSynth.triggerAttack(time, .01)
      noiseSynth.noise.type = noise
      time += dur
    })
    noiseSynth.triggerRelease(time + dur)
    triangleSynth.triggerRelease(time + dur)
  }
}
export const toggleSounds = enable => {
  enabled = enable
}

export const playSound = id => {
  try {
    if (enabled) sounds[id]()
  } catch {
    // do nothing
  }
}