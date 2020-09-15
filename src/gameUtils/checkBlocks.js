import { addTextToQueue } from '../textUtils'

/**
 * @description Method to add a block to the inventory
 * @param {Object} block the block to add
 */
const addBlockToInventory = block => {
  if (window.CTDLGAME.blockHeight >= block.height && block.height !== 0) return
  addTextToQueue(`Found a new block: ${block.height}`)
  window.CTDLGAME.blockHeight = block.height
  window.CTDLGAME.inventory.blocks.push({
    height: block.height,
    id: block.id,
    size: block.size,
    tx_count: block.tx_count
  })
}

/**
 * @description Method to fetch new blocks from the blockchain
 * @param {Number} startHeight height to start from
 */
export const checkBlocks = startHeight => {
  let url = 'https://blockstream.info/api/blocks/'

  if (typeof startHeight !== 'undefined' && startHeight !== null) url += startHeight
  fetch(url, {
      method: 'GET',
      redirect: 'follow'
    })
    .then(response => response.json())
    .then(blocks => blocks.reverse().forEach(block => addBlockToInventory(block)))
    .catch(() => {})
}