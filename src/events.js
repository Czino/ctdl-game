export default () => {
  window.addEventListener('keydown', e => {
    KEYS.push(e.key.toLowerCase());
  })

  window.addEventListener('keyup', e => {
    KEYS = KEYS.filter(key => {
      return key !== e.key.toLowerCase()
    })
  })
}