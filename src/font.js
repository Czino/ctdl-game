import font from './sprites/font'

export const write = (context, text, { x, y, w }, align = 'left', shadow, limit = 999, sub, color) => {
  const startX = align === 'left' ? x : x + w
  const endX = align === 'left' ? startX + w : startX - w

  if (shadow) {
    write(context, text, { x: x + 1, y: y, w }, align, false, limit, sub)
    context.globalCompositeOperation = 'difference'
    write(context, text, { x: x + 1, y: y, w }, align, false, limit, sub)
    context.globalCompositeOperation = 'source-over'
    write(context, text, { x: x, y: y + 1, w }, align, false, limit, sub)
    context.globalCompositeOperation = 'difference'
    write(context, text, { x: x, y: y + 1, w }, align, false, limit, sub)
    context.globalCompositeOperation = 'source-over'
  }

  text = text.split('')

  if (align === 'right') {
    x = startX
    text.reverse()
  }
  text.some(char => {
    let data = !sub ? font[char] || font['?'] : font['sub-' + char] || font['?']
    if (char === '\n'
      || (align === 'left' && x + data.w > endX)
      || (align === 'right' && x - data.w < endX)) {
      x = startX
      y += data.h
    }

    if (align === 'right') {
      x = x - data.w
    }

    if (char !== '\n' && !(char === ' ' && x === startX)) {

      context.drawImage(
        window.CTDLGAME.assets.font,
        data.x, data.y, data.w, data.h,
        x, y, data.w, data.h
      )

      if (color) {
        context.globalCompositeOperation = 'source-atop'
        context.fillStyle = color
        context.fillRect(x, y, data.w, data.h)
        context.globalCompositeOperation = 'source-over'
      }

      if (align === 'left') {
        x += data.w + 1
      } else {
        x -= 1
      }
    }

    limit--
    if (limit < 0) return true
  })
}