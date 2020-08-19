import hodlonaut from './sprites/hodlonaut'
import hodlonautSprite from './sprites/hodlonaut.png'
import katoshi from './sprites/katoshi'
import katoshiSprite from './sprites/katoshi.png'

const sprites = {
    hodlonaut: {
        img: hodlonautSprite,
        data: hodlonaut
    },
    katoshi: {
        img: katoshiSprite,
        data: katoshi
    }
}

export default function(name, context, pos) {
    this.name = name;
    this.sprite = null
    this.spriteData = sprites[name].data
    this.hasLoaded
    this.context = context
    this.pos = pos
    this.status = 'idle'
    this.direction = 'right'
    this.frame = 0

    this.idle = () => {
        if (this.status === 'jump') return
        this.status = 'idle'
    }
    this.moveLeft = () => {
        if (this.status === 'jump') return
        this.status = 'move'
        this.direction = 'left'
        this.pos.x -= 2
    }
    this.moveRight = () => {
        if (this.status === 'jump') return
        this.status = 'move'
        this.direction = 'right'
        this.pos.x += 2
    }
    this.jump = () => {
        if (this.status === 'jump') return
        this.frame = 0
        this.status = 'jump'
    }
    this.back = () => {
        if (this.status === 'jump') return
        this.status = 'back'
    }
    this.action = () => {
        if (this.status === 'jump') return
        this.status = 'action'
    }
    this.draw = () => {
        if (this.status !== 'idle' || Math.random() < .05) {
            this.frame++
        }
        if (this.status === 'jump') {
            this.pos.x += this.direction === 'right' ? 2 : -2
        }

        if (this.frame >= this.spriteData[this.direction][this.status].length) {
            this.frame = 0
            if (this.status === 'jump') {
                this.status = 'idle'
            }
        }
        let data = this.spriteData[this.direction][this.status][this.frame]

        this.context.drawImage(
            this.sprite,
            data.x, data.y, data.w, data.h,
            this.pos.x, this.pos.y - data.h, data.w, data.h
        )
    }
    this.load = () => {
        return new Promise(resolve => {
            const newImg = new Image;
            newImg.onload = () => {
                this.sprite = newImg
                resolve(this.sprite)
            }
            newImg.src = sprites[this.name].img;
        })
    }
}