let hooks = []

/**
 * @description Method to add hook to queue
 * @param {Function} hook the hook
 */
export const addHook = hook => hooks.push(hook)

/**
 * @description Method to execute hooks in queue
 */
export const executeHooks = () => {
  hooks.map(hook => hook())
  hooks = []
}