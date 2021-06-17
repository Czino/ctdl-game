import spriteData from '../sprites/pmullr'
import NPC from './NPC'
import { addHook, CTDLGAME } from '../gameUtils'
import { sense } from '../enemies/enemyUtils'
import { getClosest } from '../geometryUtils'
import { random } from '../arrayUtils'
import { addTextToQueue } from '../textUtils'

class PMullr extends NPC {
  constructor(id, options) {
    super(id, options)
    this.spriteData = spriteData
    this.spriteId = 'pmullr'
    this.senseRadius = 200
    this.w = this.spriteData[this.direction][this.status][0].w
    this.h = this.spriteData[this.direction][this.status][0].h
    this.pulse = false
    this.thingsToSaySelect = [
      ['pmullr:\nopen your eyes\nlook up to the sky and\nseeeeeeeeeeeeeeeee'],
      ['pieter:\nFIGHT MEMES WITH MEMES'],
      ['ptr:\nbro when content patch\nsimulation getting boring'],
      ['pjetr:\nThe sun is using up too\nmuch energy'],
      ['p:\nSkynet intensifies'],
      ['the p:\nRight now at this very\nmoment I\'m still bullish'],
      ['the mullr:\nKeep an eye out'],
      [
        'Peter:\ncraigs lawsuits are like a\nblockchain, lawyer fees are the incentive',
        'Peter:\nkleiman case is the\ngenesis lawsuit'
      ],
      ['iron mullr:\nJust realized that iron will moon too', 'iron mullr:\nI\'m made of iron'],
      [
        'pepe mullr:\nI\'m selling my 1ton Rai stone\nI really don\'t want to pay\nfor transport',
        'pepe mullr:\nso we can settle ownership on paper, I promise I won\'t\ntouch it',
        'pepe mullr:\nDMs are open'
      ],
      ['pether:\nLet\'s call this bubble\nthe Dot Eth bubble'],
      ['mullr:\nTIL: Bitcoin is a\nEurylahine fish'],
      ['mllr:\nis this what late stage\nsoviet union felt like sir'],
      [
        'Peter Mueller:\nWe\'re still waiting for the\nkey proof that Craig is\nSatoshi',
        'Peter Mueller:\nLiterally'
      ],
      ['ptr mllr:\nBREAKING: BITCOIN BANS ITSELF'],
      ['citizen no. 16 1321121218:\nSo what\'s your social score citizen no. 78543?'],
      ['piotor:\nParents with 12 kids used\nmore leverage'],
      ['Pehter:\nWhat if Bitcoin was\nSatoshi\'s side project?'],
      [
        'P.:\nIt was long sighted of\nsatoshi not to consolidate\nhis Bitcoin wallets',
        'P.:\nMight also tell us a little about Satoshis long term planning.',
        'P.:\nMaybe the idea really was\nnot to come back eventually and to make sure',
        'P.:\nyou cannot brute force a\nkey to gain access to a\nlarge stash of early coins'
      ],
      [
        'P.M.:\nDid you know that there is no present?',
        'P.M.:\nEvery thought you have\ncame from the past',
        'P.M.:\nNo really, the time\ndifference isn\'t as high that you\'d notice,',
        'P.M.:\nbut your thoughts are\nliterally older than you\nliterally think',
        'P.M.:\nBasically you\'re lagging\nbehind all the time',
        'P.M.:\nIf you really think about it\nyou\'re living in the past,\ni mean literally',
        'P.M.:\nThe stuff you will think the next second is being\nprocessed right now',
        'P.M.:\nwhich means you\'re kind of\nliving in the future too',
        'P.M.:\nbut since there is no\npresent your past creates\nyour future thoughts',
        'P.M.:\nKind of fkd up'
      ],
      ['petalik:\nOk guys could you please\nstop inflating your national currencies']
      [
        'Mullr Twin:\nThe Intro Sample from\n\'Aphex Twin - Ageispolis\' is\nnow playing in your mind',
        'Mullr Twin:\nChill the fuck out\nI got this',
        'Mullr Twin:\nGot nothing to worry about trust me',
        'Mullr Twin:\nEverything\'s going to be\nokay'
      ],
      [
        'peternacci:\nCame home, entered the\ndoor and found 4 bowls in\ndifferent sizes',
        'peternacci:\nfrom small to big neatly\narranged in a fibonacci\npattern laying on the floor',
        'peternacci:\nim scared'
      ],
      ['PMR:\nWow man i still can\'t believe police cracked sha-265 using a banana'],
      [
        'Petrus:\nBitcoin is literally the only\nmoney you can take with\nyou to the afterlife',
        'Petrus:\nNobody realized this yet'
      ],
      [
        'Planet Mullr:\nYou are now aware that\nyou\'re standing on a giant\nrotating rock',
        'Planet Mullr:\nthat revolves around a giant ball of gas with no\ndestination in sight'
      ],
      ['P Mull:\nYou are now aware that\nyou\'re carrying a human skull with you all the time'],
      [
        'Pmux:\ni think im ready to\ntransmute into my next\nform beyond',
        'Pmux:\nthe human physical body.\nSimulation Admins please\ndeploy patch',
      ]
    ]
  }

  direction = 'left'
  status = 'idle'

  select = () => {
    if (!this.thingsToSaySelect || this.isSelected) return
    this.isSelected = true

    let whatToSay = random(this.thingsToSaySelect)
    whatToSay.map((text, index) => {
      if (/Ageispolis/.test(text)) {
        window.SNDTRCK.initSoundtrack('ageispolis')
        window.SNDTRCK.changeVolume(1)
        this.playingAgeispolis = true
      }
      if (index === whatToSay.length - 1) {
        addTextToQueue(text, () => {
          this.isSelected = false
          if (this.playingAgeispolis) {
            this.playingAgeispolis = false
            window.SNDTRCK.initSoundtrack('stellaSplendence')
          }
        })
      } else {
        addTextToQueue(text)
      }
    })
  }

  update = () => {
    let sensedFriends = sense(this, /Character/)

    if (sensedFriends.length > 0 && !this.pulse && !this.playingAgeispolis) {
      let closestFriend = getClosest(this, sensedFriends)
      let distance = Math.abs(this.getCenter().x - closestFriend.getCenter().x)
      let volume = (100 - distance) / 100
      if (volume > 1) volume = 1
      if (volume < 0) volume = 0
      window.SOUND.playSound('deepMagic', { volume })
      window.SNDTRCK.changeVolume(1 - volume)
      addHook(CTDLGAME.frame + 40, () => this.pulse = false)
      this.pulse = true
    } else if (sensedFriends.length === 0) {
      window.SNDTRCK.changeVolume(1)
    }

    this.draw()

    this.frame++
  }

  applyGravity = false
}
export default PMullr