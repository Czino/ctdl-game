export let textQueue = []

/**
 * @description Method to overwritte current text queue
 * @param {Object[]} newTextQueue 
 * @param {Boolean} preventCallbacks
 * @returns {void}
 */
export const setTextQueue = (newTextQueue, preventCallbacks) => {
    if (!preventCallbacks) {
        textQueue
            .filter(text => text.callback)
            .forEach(text => text.callback())
    }
    textQueue = newTextQueue
}