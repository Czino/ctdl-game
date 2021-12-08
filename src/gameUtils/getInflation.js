import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'

export const getInflation = () => Math.pow(constants.INFLATIONRATE, CTDLGAME.timePassed)

export default getInflation
