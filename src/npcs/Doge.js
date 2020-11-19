import Agent from '../Agent'
import dogeSprite from '../sprites/doge'
import { CTDLGAME } from '../gameUtils'
import constants from '../constants'
import { random } from '../arrayUtils'
import { addTextToQueue } from '../textUtils'

class Doge extends Agent {
  constructor(id, options) {
    super(id, options)
    this.color = options.color
    this.solving = random(this.puzzles)
  }
  class = 'Doge'
  w = 13
  h = 12
  puzzles = [
    {
      text: '1+2=?',
      color: 'blue'
    },
    {
      text: '6/3=?',
      color: 'yellow'
    },
    {
      text: '7*23=?',
      color: 'white'
    },
    {
      text: 'cos^-1(3/4)=?',
      color: 'orange'
    },
    {
      text: '4^2=?',
      color: 'pink'
    },
    {
      text: '9-8=?',
      color: 'white'
    },
    {
      text: '√23=?',
      color: 'red'
    },
    {
      text: '7*3=?',
      color: 'green'
    },
    {
      text: '4(2*3)=?',
      color: 'orange'
    },
    {
      text: '42+75=?',
      color: 'yellow'
    },
    {
      text: 'x^3*3(21)=?',
      color: 'blue'
    }
  ]

  draw = () => {
    let spriteData = dogeSprite[this.direction][this.color]

    if (CTDLGAME.frame % 32 === 0) this.frame++
    if (CTDLGAME.frame % 64 === 0) {
      this.solving = random(this.puzzles)
    }
    if (this.frame >= spriteData.length) {
      this.frame = 0
    }

    const data = spriteData[this.frame]


    constants.gameContext.drawImage(
      CTDLGAME.assets['doge'],
      data.x, data.y, data.w, data.h,
      this.x, this.y, this.w, this.h
    )

    if (this.frame === 0) {
      const length = Math.min(this.solving.text.length - 2, 5)
      const offset = length === 3 ? 1 : 0
      for (let i = length; i > 0; i--) {
        constants.gameContext.fillStyle = this.solving.color
        constants.gameContext.globalAlpha = Math.random()
        constants.gameContext.fillRect(
          this.direction === 'left' ? this.x + 4 - offset + i : this.x + this.w - 4 + offset + i,
          this.y + 8,
          1, 1
        )
      }
      constants.gameContext.globalAlpha = 1
    }
  }

  update = () => {
    this.draw()
  }

  touch = () => {
    if (!this.isTouched) {
      this.isTouched = true
      addTextToQueue(this.solving.text, () => {
        this.isTouched = false
      })
    }
  }
}

export default Doge