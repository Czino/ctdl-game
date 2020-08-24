import constants from './constants'
import hodlonaut from './sprites/hodlonaut.png'
import katoshi from './sprites/katoshi.png'
import block from './sprites/block.png'
import ground from './sprites/ground.png'

const progressBar = {
    x: 19.5,
    y: constants.HEIGHT / 2 - 20.5,
    w: constants.WIDTH - 40,
    h: 20
}

export const assets = {
    hodlonaut,
    katoshi,
    block,
    ground
}

export const loadAsset = asset => new Promise(resolve => {
    const newImg = new Image;
    newImg.onload = () => {
        resolve(newImg)
    }
    newImg.src = asset
})

export const showProgressBar = progress => {
    constants.overlayContext.fillStyle = '#FFF'
    constants.overlayContext.strokeStyle = '#FFF'
    constants.overlayContext.lineWidth = 1

    constants.overlayContext.beginPath()
    constants.overlayContext.rect(progressBar.x, progressBar.y, progressBar.w, progressBar.h)
    constants.overlayContext.stroke()

    constants.overlayContext.fillRect(
        progressBar.x + .5, progressBar.y + .5, progressBar.w * progress - 1, progressBar.h - 1
    )

    constants.overlayContext.fillStyle = '#212121'
    constants.overlayContext.font = '12px courier'
    let text = Math.round(progress * 100) + '%'
    let metrics = constants.overlayContext.measureText(text)
    constants.overlayContext.fillText(
        text,
        progressBar.x + progressBar.w / 2 - metrics.width / 2,
        progressBar.y + progressBar.h / 2 + 3
    );
}