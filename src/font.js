import font from './sprites/font'

export const write = (context, text, { x, y, w }) => {
  const startX = x
  const endX = startX + w

  text.split('').forEach(char => {
    let data = font[char] || font['?']


    if (x + data.w > endX || char === '\n') {
      x = startX
      y += data.h
    }

    if (char !== '\n') {
      context.drawImage(
        window.CTDLGAME.assets.font,
        data.x, data.y, data.w, data.h,
        x, y, data.w, data.h
      )
      x += data.w + 1
    }
  })
}