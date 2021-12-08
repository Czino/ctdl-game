
import { BehaviorTree, Selector, SUCCESS } from '../../node_modules/behaviortree/dist/index.node'

import spriteData from '../sprites/citizen'
import { CTDLGAME } from '../gameUtils'
import { intersects, getClosest } from '../geometryUtils'
import constants from '../constants'
import { addTextToQueue } from '../textUtils'
import Human from './Human'
import { write } from '../font'

// Selector: runs until one node calls success
const regularBehaviour = new Selector({
  nodes: [
    // 'moveToPointX',
    'idle'
  ]
})

// what does czino do?
// go in and outside the house
// greet hodlonaut and katja
// talk: storyline needs further work
// make a tea
// work on the land
const tree = new Selector({
  nodes: [
    'survive',
    regularBehaviour
  ]
})

class Czino extends Human {
  constructor(id, options) {
    super(id, options)
    this.spriteData = spriteData
    this.context = 'charContext'
    this.maxHealth = options.maxHealth ?? Math.round(Math.random() * 5) + 5
    this.health = options.health ?? this.maxHealth
    this.strength = 1
    this.attackRange = options.attackRange ?? Math.ceil(Math.random() * 70) + 70
    this.senseRadius = this.attackRange
    this.applyGravity = options.applyGravity ?? true
    this.walkingSpeed = options.walkingSpeed || 3
    this.runningSpeed = options.runningSpeed || Math.round(Math.random() * 2) + 4
    this.protection = 0

    this.goal = options.goal
    if (!this.goal && Math.random() < .5 && CTDLGAME.world) this.goal = Math.round(Math.random() * CTDLGAME.world.w)
  }

  bTree = new BehaviorTree({
    tree,
    blackboard: this
  })

  onDie = () => {
    addTextToQueue(`Czino got rekt`)
  }

  moveLeft = {
    condition: () => true,
    effect: () => {
      this.direction = 'left'
      this.status = 'move'
      return SUCCESS
    }
  }
  moveRight = {
    condition: () => true,
    effect: () => {
      this.direction = 'right'
      this.status = 'move'

      return SUCCESS
    }
  }
  
  back = {
    condition: () => true,
    effect: () => {
      this.status = 'back'

      return SUCCESS
    }
  }

  duck = {
    condition: () => true,
    effect: () => {
      this.status = 'duck'

      return SUCCESS
    }
  }

  attack = {
    condition: () => true,
    effect: () => {
      this.status ='attack'

      return SUCCESS
    }
  }

  senseControls = () => {
    let id = CTDLGAME.multiPlayer ? this.id : 'singlePlayer'

    let controls = []
    if (CTDLGAME.touchScreen && this.selected) {
      controls = Object.keys(constants.CONTROLS[id])
        .filter(key => window.BUTTONS.some(button => button.action === constants.CONTROLS[id][key]))
        .map(key => constants.CONTROLS[id][key])
    } else {
      controls = window.KEYS
        .filter(key => Object.keys(constants.CONTROLS[id]).indexOf(key) !== -1)
        .map(key => constants.CONTROLS[id][key])
      // controls = Object.keys(constants.CONTROLS[id])
      //   .filter(key => window.KEYS.indexOf(key) !== -1)
      //   .map(key => constants.CONTROLS[id][key])
    }

    let action = 'idle'
    // merge mixed behaviours
    if (controls.length > 0) {
      action = controls.pop()
    }

    if (this[action] && this[action].condition()) this[action].effect()
  }

  update = () => {
    if (!this.sprite) this.sprite = CTDLGAME.assets.czino

    if (CTDLGAME.lockCharacters) {
      this.draw()
      return
    }

    this.applyPhysics()
    if (this.status === 'fall') this.status = 'hurt'

    if (this.status === 'hurt' && this.vx === 0 && this.vy === 0) {
      this.status = 'idle'
    }

    const senseBox = this.getSenseBox()
    this.sensedObjects = CTDLGAME.quadTree.query(senseBox)

    this.touchedObjects = CTDLGAME.quadTree
      .query(this.getBoundingBox())
      .filter(obj => intersects(this.getBoundingBox(), obj.getBoundingBox()))


    if (window.DRAWSENSORS) {
      constants.charContext.beginPath()
      constants.charContext.rect(senseBox.x, senseBox.y, senseBox.w, senseBox.h)
      constants.charContext.stroke()
    }

    this.sensedEnemies = this.sensedObjects
      .filter(enemy => enemy.enemy && enemy.health && enemy.health > 0)
      .filter(enemy => Math.abs(enemy.getCenter().x - this.getCenter().x) <= this.senseRadius)

    this.sensedFriends = this.sensedObjects
      .filter(friend => /Character|Human/.test(friend.getClass()) && friend.id !== this.id && friend.status !== 'rekt')
      .filter(friend => Math.abs(friend.getCenter().x - this.getCenter().x) <= this.senseRadius)

    if (Math.abs(this.vy) < 3 && !/fall|rekt|hurt/.test(this.status)) {
      this.senseControls()
    }

    if (this.frame >= this.spriteData[this.direction][this.status].length) {
      this.frame = 0
      if (/action/.test(this.status)) this.status = 'idle'
    }

    CTDLGAME.focusViewport = this


    this.draw()

    if (meter.volume > 0.01 && Math.random() > 0.3) {
      constants.charContext.fillStyle = '#380d0d'
      constants.charContext.fillRect(
        this.x + this.w / 2 - 1 + (this.direction === 'left' ? 0 : 1) - (this.status === 'jump' && this.direction === 'left' ? 1 : 0),
        this.y + 7,
        1, 1
      )
    }
  }
}
export default Czino

let meter = null;
const audioContext = new AudioContext()
    meter = createAudioMeter(audioContext)
    try {
      // monkeypatch getUserMedia
      navigator.getUserMedia = 
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;

      // ask for an audio input
      navigator.getUserMedia(
      {
          "audio": {
              "mandatory": {
                  "googEchoCancellation": "false",
                  "googAutoGainControl": "false",
                  "googNoiseSuppression": "false",
                  "googHighpassFilter": "false"
              },
              "optional": []
          },
      }, gotStream, didntGetStream);
  } catch (e) {
      alert('getUserMedia threw exception :' + e);
  }



  function didntGetStream() {
    alert('Stream generation failed.');
}

var mediaStreamSource = null;

function gotStream(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Create a new volume meter and connect it.
    meter = createAudioMeter(audioContext);
    mediaStreamSource.connect(meter);

    // kick off the visual updating
    drawLoop();
}


function createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
  var processor = audioContext.createScriptProcessor(512);
  processor.onaudioprocess = volumeAudioProcess;
  processor.clipping = false;
  processor.lastClip = 0;
  processor.volume = 0;
  processor.clipLevel = clipLevel || 0.98;
  processor.averaging = averaging || 0.95;
  processor.clipLag = clipLag || 750;

  // this will have no effect, since we don't copy the input to the output,
  // but works around a current Chrome bug.
  processor.connect(audioContext.destination);

  processor.checkClipping =
    function () {
      if (!this.clipping)
        return false;
      if ((this.lastClip + this.clipLag) < window.performance.now())
        this.clipping = false;
      return this.clipping;
    };

  processor.shutdown =
    function () {
      this.disconnect();
      this.onaudioprocess = null;
    };

  return processor;
}

function volumeAudioProcess(event) {
  var buf = event.inputBuffer.getChannelData(0);
  var bufLength = buf.length;
  var sum = 0;
  var x;

  // Do a root-mean-square on the samples: sum up the squares...
  for (var i = 0; i < bufLength; i++) {
    x = buf[i];
    if (Math.abs(x) >= this.clipLevel) {
      this.clipping = true;
      this.lastClip = window.performance.now();
    }
    sum += x * x;
  }

  // ... then take the square root of the sum.
  var rms = Math.sqrt(sum / bufLength);

  // Now smooth this out with the averaging factor applied
  // to the previous sample - take the max here because we
  // want "fast attack, slow release."
  this.volume = Math.max(rms, this.volume * this.averaging);
}


function drawLoop() {
  // draw a bar based on the current volume
  
  // set up the next visual callback
  window.requestAnimationFrame( drawLoop );
}