export const drawPolygon = (context, coords) => {
  let pointer = coords.shift()
  context.beginPath()
  context.moveTo(pointer.x, pointer.y)
  coords.map(offset => {
    pointer.x += offset.x
    pointer.y += offset.y
    context.lineTo(pointer.x, pointer.y)
  })
  context.closePath()
  context.stroke()
  context.fill();
}