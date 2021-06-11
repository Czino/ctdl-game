import * as db from '../db'
import { start } from 'tone'

import constants from '../constants'
import { CTDLGAME, loadGame, newGame, saveGame, saveStateExists, showIntro } from '../gameUtils'
import { isSoundLoaded, playSound, toggleSounds } from '../sounds'
import { stopMusic, toggleSoundtrack } from '../soundtrack'
import startScreenHandler from './startScreenHandler'
import initEvents from './initEvents'
import { setTextQueue } from '../textUtils'
import { textQueue } from '../textUtils/textQueue'
import { switchCharacter } from './switchCharacter'


export let buttonClicked

export const setButtonClicked = button => buttonClicked = button

export const buttons = [
  {
    action: 'initGame',
    x: 0,
    y: 0,
    w: constants.WIDTH,
    h: constants.HEIGHT,
    active: true,
    onclick: async () => {
      await start() // start tone JS

      CTDLGAME.isSoundLoaded = isSoundLoaded()

      if (!CTDLGAME.isSoundLoaded) return

      constants.BUTTONS
        .filter(button => /initGame/.test(button.action))
        .forEach(button => button.active = false)

      constants.BUTTONS
        .filter(button => /newGame/.test(button.action))
        .forEach(button => button.active = true)

      if (!(await saveStateExists())) {
        CTDLGAME.newGame = true
      } else {
        constants.BUTTONS
          .filter(button => /loadGame/.test(button.action))
          .forEach(button => button.active = true)
      }

      initEvents(true)
    }
  },
  {
    action: 'loadGame',
    x: constants.WIDTH / 2 - 41,
    y: constants.HEIGHT / 2 + 20,
    w: 80,
    h: 10,
    active: false,
    onclick: async () => {
      stopMusic()
      playSound('select')

      CTDLGAME.startScreen = false
      await loadGame()

      constants.BUTTONS
        .filter(button => /newGame|loadGame|singlePlayer|multiPlayer|skipIntro/.test(button.action))
        .forEach(button => button.active = false)

      window.removeEventListener('mouseup', startScreenHandler)
      window.removeEventListener('touchstart', startScreenHandler)
      initEvents(false)
    }
  },
  {
    action: 'newGame',
    x: constants.WIDTH / 2 - 35,
    y: constants.HEIGHT / 2,
    w: 60,
    h: 10,
    active: true,
    onclick: () => {
      playSound('select')

      showIntro()
      CTDLGAME.startScreen = false
      CTDLGAME.cutScene = true

      constants.BUTTONS
        .filter(button => /newGame|loadGame|singlePlayer|multiPlayer/.test(button.action))
        .forEach(button => button.active = false)
      constants.BUTTONS
        .filter(button => /skipIntro/.test(button.action))
        .forEach(button => button.active = true)

      window.removeEventListener('mouseup', startScreenHandler)
      window.removeEventListener('touchstart', startScreenHandler)
      initEvents(false)
    }
  },
  {
    action: 'singlePlayer',
    x: constants.WIDTH / 2 - 43,
    y: constants.HEIGHT / 2 + 40,
    w: 30,
    h: 10,
    active: true,
    onclick: () => {
      playSound('select')
      CTDLGAME.multiPlayer = false
    }
  },
  {
    action: 'multiPlayer',
    x: constants.WIDTH / 2 - 6,
    y: constants.HEIGHT / 2 + 40,
    w: 30,
    h: 10,
    active: true,
    onclick: () => {
      playSound('select')
      CTDLGAME.multiPlayer = true
    }
  },
  {
    action: 'skipIntro',
    x: constants.WIDTH / 2 - 9,
    y: constants.HEIGHT - 60,
    w: 60,
    h: 10,
    active: false,
    onclick: () => {
      playSound('select')

      setTextQueue([]) // last text in textqueue will call callback to start game

      constants.BUTTONS
        .filter(button => /skipIntro/.test(button.action))
        .forEach(button => button.active = false)
    }
  },
  {
    action: 'skipCutScene',
    x: constants.WIDTH - 30,
    y: constants.HEIGHT - 12,
    w: 30,
    h: 10,
    active: false,
    onclick: () => {
      textQueue.map(text => text.callback ? text.callback() : null)
      setTextQueue([])

      constants.BUTTONS
        .filter(button => /skipIntro/.test(button.action))
        .forEach(button => button.active = false)
    }
  },
  {
    action: 'yes',
    x: 10,
    y: constants.HEIGHT - 12,
    w: 30,
    h: 10,
    active: false,
    disable: () => {
      constants.BUTTONS
        .filter(button => /yes/.test(button.action))
        .forEach(button => button.active = false)
    }
  },
  {
    action: 'nah',
    x: constants.WIDTH - 40,
    y: constants.HEIGHT - 12,
    w: 30,
    h: 10,
    active: false,
    disable: () => {
      constants.BUTTONS
        .filter(button => /nah/.test(button.action))
        .forEach(button => button.active = false)
    }
  },
  {
    action: 'save',
    x: 3,
    y: 3,
    w: 9,
    h: 9,
    active: true,
    onclick: () => {
      saveGame()
    }
  },
  {
    action: 'music',
    x: constants.WIDTH - 3 - 9 - 11,
    y: 3,
    w: 9,
    h: 9,
    active: true,
    onclick: async () => {
      CTDLGAME.options.music = !CTDLGAME.options.music
      toggleSoundtrack(CTDLGAME.options.music)
      await db.set('options', CTDLGAME.options)
    }
  },
  {
    action: 'sound',
    x: constants.WIDTH - 3 - 9 ,
    y: 3,
    w: 9,
    h: 9,
    active: true,
    onclick: async () => {
      CTDLGAME.options.sound = !CTDLGAME.options.sound
      await db.set('options', CTDLGAME.options)
      toggleSounds(CTDLGAME.options.sound)
    }
  },
  { action: 'jump', x: 21 * 4, y: constants.HEIGHT - 20, w: 18, h: 18, active: false, hasBorder: true},
  { action: 'attack', x: 21 * 5, y: constants.HEIGHT - 20, w: 18, h: 18, active: false, hasBorder: true},
  { action: 'moveLeft', x: 0, y: constants.HEIGHT - 20, w: 18, h: 18, active: false, hasBorder: true},
  { action: 'moveRight', x: 21, y: constants.HEIGHT - 20, w: 18, h: 18, active: false, hasBorder: true},
  { action: 'back', x: 21 * 2, y: constants.HEIGHT - 20, w: 18, h: 18, active: false, hasBorder: true},
  { action: 'duck', x: 21 * 2, y: constants.HEIGHT - 20, w: 18, h: 18, active: false, hasBorder: true},
  { action: 'switch', x: 21 * 3, y: constants.HEIGHT - 20, w: 18, h: 18, active: false, hasBorder: true, onclick: switchCharacter}
]


export const initGameButton = buttons.find(btn => btn.action === 'initGame')
export const newGameButton = buttons.find(btn => btn.action === 'newGame')
export const loadGameButton = buttons.find(btn => btn.action === 'loadGame')
export const singlePlayerButton = buttons.find(btn => btn.action === 'singlePlayer')
export const multiPlayerButton = buttons.find(btn => btn.action === 'multiPlayer')
export const skipCutSceneButton = buttons.find(btn => btn.action === 'skipCutScene')
export const yesButton = buttons.find(btn => btn.action === 'yes')
export const nahButton = buttons.find(btn => btn.action === 'nah')
export const saveButton = buttons.find(button => button.action === 'save')
export const musicButton = buttons.find(button => button.action === 'music')
export const soundButton = buttons.find(button => button.action === 'sound')
export const duckButton = buttons.find(button => button.action === 'duck')
export const backButton = buttons.find(button => button.action === 'back')


export default buttons