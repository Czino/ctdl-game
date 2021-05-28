import { getInflation } from './getInflation'

export const getBTCPrice = price => Math.round(price * 100000000 / getInflation() * 1000) / 1000

export default getBTCPrice