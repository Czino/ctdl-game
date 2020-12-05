import { CTDLGAME } from './CTDLGAME'
import { addTextToQueue } from '../textUtils'
import { newGame } from './newGame'
import { stopMusic } from '../soundtrack'

/**
 * @description Method to prepare new game
 */
export const showIntro = () => {
  addTextToQueue([
    'In a not so distant',
    'alternative universe,',
    'katoshi and hodlonaut found',
    'themselves in a transitional',
    'world.'
  ].join('\n'), null, true)
  addTextToQueue([
    'Governments around the',
    'globe have been clinging to',
    'their last straws',
    'to maintain power.'
  ].join('\n'), null, true)
  addTextToQueue([
    'The global economy is',
    'collapsing while all the',
    'money rapidly loses',
    'its value.'
  ].join('\n'), null, true)
  addTextToQueue([
    'Many people fell victim',
    'to the collapse, others',
    'became viciously desperate',
    'while only the strong and',
    'few maintain a good life.'
  ].join('\n'), null, true)
  addTextToQueue([
    'Just when the situation',
    'seemed hopeless...'
  ].join('\n'), null, true)
  addTextToQueue([
    'Through a miracle,',
    'the two cats discovered',
    'the magic internet money',
    'we know as Bitcoin.'
  ].join('\n'), () => {
    stopMusic()
    newGame()
    CTDLGAME.cutScene = false
  }, true)
}