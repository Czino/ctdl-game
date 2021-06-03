export let textQueue = []

/**
 * @description Method to overwritte current text queue
 * @param {Object[]} newTextQueue 
 * @returns {void}
 */
export const setTextQueue = newTextQueue => {
    textQueue
        .filter(text => text.callback)
        .forEach(text => text.callback())
    textQueue = newTextQueue
}