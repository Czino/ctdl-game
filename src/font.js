import font from './sprites/font'

export const write = (context, text, { x, y, w }, align = 'left', shadow) => {
  const startX = align === 'left' ? x : x + w
  const endX = align === 'left' ? startX + w : startX - w


  if (shadow) {
    write(context, text, { x: x + 1, y: y, w }, align)
    context.globalCompositeOperation = 'difference'
    write(context, text, { x: x + 1, y: y, w }, align)
    context.globalCompositeOperation = 'source-over'
    write(context, text, { x: x, y: y + 1, w }, align)
    context.globalCompositeOperation = 'difference'
    write(context, text, { x: x, y: y + 1, w }, align)
    context.globalCompositeOperation = 'source-over'
  }
  text = text.split('')

  if (align === 'right') {
    x = startX
    text.reverse()
  }
  text.forEach(char => {
    let data = font[char] || font['?']

    if (char === '\n'
      || (align === 'left' && x + data.w > endX)
      || (align === 'right' && x - data.w < endX)) {
      x = startX
      y += data.h
    }

    if (align === 'right') {
      x = x - data.w
    }

    if (char !== '\n') {
      context.drawImage(
        window.CTDLGAME.assets.font,
        data.x, data.y, data.w, data.h,
        x, y, data.w, data.h
      )

      if (align === 'left') {
        x += data.w + 1
      } else {
        x -= 1
      }
    }
  })
}