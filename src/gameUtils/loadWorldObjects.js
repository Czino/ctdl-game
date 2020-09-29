import * as db from '../db'

/**
 * @description Method to load world
 */
export const loadWorldObjects = async worldId => await db.get(`objects-${worldId}`)