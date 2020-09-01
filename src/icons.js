import icons from './sprites/icons'

export const drawIcon = (context, icon, { x, y, opacity }) => {
  const data = icons[icon]
  context.globalAlpha = opacity ?? 1
  context.drawImage(
    window.CTDLGAME.assets.icons,
    data.x, data.y, data.w, data.h,
    x, y, data.w, data.h
  )
  context.globalAlpha = 1
}