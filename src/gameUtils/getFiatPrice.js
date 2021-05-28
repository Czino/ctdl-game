import { getInflation } from './getInflation'

export const getFiatPrice = price => Math.round(price * getInflation() * 100) / 100

export default getFiatPrice