const sleep = () => new Promise(resolve => setTimeout(resolve, Math.round((Math.random() + 1) * 1500))) // 

/**
 * @description Method to preload asset
 * @param {String} asset path to asset
 */
export const loadAsset = asset => new Promise(async (resolve) => {
  const newImg = new Image
  await sleep()
  newImg.onload = () => {
    resolve(newImg)
  }
  newImg.src = asset

  if (newImg.complete) {
    resolve(newImg)
  }
})