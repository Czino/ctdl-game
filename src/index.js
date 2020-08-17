import { Engine, Bodies, Body, Render, World, Mouse, MouseConstraint, Events } from 'matter-js'

const checkBlockTime = 1000 * 60 * 2 // minutues
const canvas = document.getElementById('ctdl-game')
checkBlocks()

let engine = Engine.create({
  enableSleeping: true
})
const render = Render.create({
  element: canvas,
  engine: engine,
  options: {
    wireframes: false,
    width: 640,
    height: 600,
    pixelRatio: 1,
    background: '#18181d',
    showSleeping: false,
    showDebug: true
  }
})
let mouse = Mouse.create(canvas)
let mouseConstraint = MouseConstraint.create(engine, { mouse })
let ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true })

World.add(engine.world, mouseConstraint)
World.add(engine.world, ground)

Engine.run(engine)
Render.run(render)

setInterval(checkBlocks, checkBlockTime)

function checkBlocks() {
  fetch('https://blockstream.info/api/blocks/', {
    method: 'GET',
    redirect: 'follow'
  })
    .then(response => response.json())
    .then(blocks => addBlock(blocks.pop()))
    .catch(error => console.log('error', error));
}

function addBlock(block) {
  let box = Bodies.rectangle(0 + 80 * Math.round(Math.random() * 5), 50 + 80, 80, 80, {
      render: {
        fillStyle: '#FFF',
        strokeStyle: '#000',
        lineWidth: 4
      }
    })

    console.log(block)
    Events.on(box, 'sleepStart', (e) => {
      Body.setStatic(e.source, true)
    })
    World.add(engine.world, box)
}