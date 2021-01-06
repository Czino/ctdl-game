export const maps = [
  'city',
  'building',
  'forest',
  'rabbitHole',
  'mempool',
  'endOfTheRabbitHole',
  'dogeCoinMine',
  'grasslands',
  'czinosCitadel',
  'mtGox',
  'capitalCity',
  'citadel',
  'miningFarm',
  'moon',
]

/**
 * @description Method to load map settings
 * @param {String} id world id
 * @returns {Object} map object
 */
export const loadMap = async id => (await import(
  /* webpackMode: "lazy" */
  `./maps/${id}.js`
)).default