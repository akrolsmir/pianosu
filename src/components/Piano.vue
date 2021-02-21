<template>
  <h2>Pianosu: {{ song.title }} by {{ song.artist }}</h2>
  <div id="gameDiv" style="margin: 0 auto"></div>
  Press "P" to play or pause; "R" to rewind; "T" to fast-forward.
  <SongsList />
</template>

<script>
// Demo copied from https://github.com/photonstorm/phaser3-examples/blob/master/public/src/input/multitouch/multi%20touch%20test.js
import Phaser, { Scene } from 'phaser'
import * as Tone from 'tone'
import { summertimeDetails } from '../songs/summertime'
import { invert } from '../songs/utils'
import { takeonmeDetails } from '../songs/take-on-me'
import { passConstants, makeHitObject } from './hit-object.js'
import { makeSeekbar } from './seekbar.js'
import SongsList from './SongsList.vue'

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    extend: {
      createPiano: createPiano,
    },
    update: update,
  },
  // TODO: input: {keyboard: {target: window}} ?
  parent: 'gameDiv',
}

// Global config and constants
const CO = {
  // Same for all songs
  /** @type {Phaser.Scene} */ SCENE: undefined,
  /** @type {Tone.PolySynth} */ SYNTH: undefined,
  FALL_VELOCITY: 600 / 1000, // px/ms
  TARGET_Y: 420,
  SEEKBAR: {},
  SEEK_TEXT: {},

  // Changes betwen songs
  SONG_ID: undefined,
  SONG_DETAILS: undefined,
  KEYBOARD_TO_PIANO: undefined,
  NOTES: undefined,
}

// Time is msecs, delta is time since last update
function update(_time, _delta) {
  CO.SEEKBAR.renderObjs()
  CO.SEEK_TEXT.text = CO.SEEKBAR.textTime()
}

function preload() {
  this.load.setPath('/assets/piano')
  this.load.atlas('piano', 'piano.png', 'piano.json')
  this.load.audio(CO.SONG_ID, CO.SONG_DETAILS.soundFile)
}

function create() {
  if (this.sound.locked) {
    var text = this.add.text(560, 10, 'Press any key to start', {
      font: '16px Courier',
      fill: '#00ff00',
    })

    this.sound.once(
      'unlocked',
      function () {
        text.destroy()
        this.createPiano()
      },
      this
    )
  } else {
    this.createPiano()
  }

  // Init seekbar
  CO.SEEKBAR = makeSeekbar(this)
  CO.SEEK_TEXT = this.add.text(10, 10, CO.SEEKBAR.time())
  CO.SEEK_TEXT.setDepth(50)

  // Initialize the hit objects for this song
  passConstants(CO)
  const tune = CO.SONG_DETAILS.voice
  for (const [i, note] of tune.entries()) {
    const eighthNoteMs = (60 * 1000) / CO.SONG_DETAILS.bpm / 2
    const time = CO.SONG_DETAILS.offset + eighthNoteMs * i
    // TODO: maybe handle simultaneous notes
    CO.SEEKBAR.songObj(makeHitObject(note, time, this))
  }
}

function createPiano() {
  /** @type {Phaser.Scene} */
  const scene = this

  CO.SYNTH = new Tone.PolySynth(Tone.Synth).toDestination()

  // Draw the piano keys background. TODO: Could be static image
  const x = 100
  const y = 0
  scene.add.image(x, y, 'piano', 'panel').setOrigin(0)
  for (let i = 1; i <= 12; i++) {
    const singleKey = scene.add.image(x, y, 'piano', `key${i}`)
    singleKey.setOrigin(0)
  }

  // Play white notes on keypress
  // Keycodes at https://photonstorm.github.io/phaser3-docs/Phaser.Input.Keyboard.KeyCodes.html
  for (const keyCode of Object.keys(CO.KEYBOARD_TO_PIANO)) {
    const keyObject = scene.input.keyboard.addKey(keyCode)
    keyObject.on('down', () => {
      const note = CO.KEYBOARD_TO_PIANO[keyCode]
      CO.SYNTH.triggerAttackRelease(note, '8n')

      // Also draw a hit effect for that note
      if (CO.SEEKBAR.isPaused()) {
        addHitEffect(note)
      }
      // If not paused, record this note
      else {
        CO.SEEKBAR.playObj(
          makeHitObject(note, CO.SEEKBAR.time(), this, 0x4488aa)
        )
      }
    })
  }

  // Play controls
  const playKey = scene.input.keyboard.addKey('P')
  const music = scene.sound.add(CO.SONG_ID, { volume: 0.3 })
  playKey.on('down', () => {
    if (!music.isPlaying) {
      CO.SEEKBAR.resume()
      music.play(CO.SEEKBAR.playConfig())
    } else {
      CO.SEEKBAR.pause()
      music.pause()
    }
  })

  // Rewind/FF while unpaused doesn't replay notes correctly...
  // Move song back by 2 sec
  const rewindKey = scene.input.keyboard.addKey('R')
  rewindKey.on('down', async () => {
    if (music.isPlaying) {
      music.pause()
      CO.SEEKBAR.pause()
    }
    CO.SEEKBAR.adjust(-2000, 200)
  })

  // Fast forward by 2 sec
  const ffKey = scene.input.keyboard.addKey('T')
  ffKey.on('down', async () => {
    if (music.isPlaying) {
      music.pause()
      CO.SEEKBAR.pause()
    }
    CO.SEEKBAR.adjust(2000, 200)
  })

  function addHitEffect(note) {
    const x = CO.NOTES.indexOf(note) * 85 + 35 + 25
    const y = CO.TARGET_Y
    const rect = scene.add.rectangle(x, y, 30, 30, 0x4488aa)
    rect.setDepth(50)
    setTimeout(() => rect.destroy(), 100)
  }

  function keylabel(keyCode) {
    const keymap = { SEMICOLON: ';', QUOTES: "'" }
    return keymap[keyCode] || keyCode
  }
  Object.entries(CO.KEYBOARD_TO_PIANO).map(addTargetBlock)
  function addTargetBlock([keyCode, note]) {
    const x = CO.NOTES.indexOf(note) * 85 + 35 + 25
    const y = CO.TARGET_Y
    scene.add.rectangle(x, y, 55, 55, 0x66aaee, 0.5)
    scene.add.text(x - 10, y - 15, keylabel(keyCode), { font: '32px' })
  }
}

let game

export default {
  components: {
    SongsList,
  },
  data() {
    return {
      song: {},
    }
  },
  created() {
    // Reload song if route changed
    // See: https://next.router.vuejs.org/guide/essentials/dynamic-matching.html#reacting-to-params-changes
    this.$watch(
      () => this.$route.params,
      (toParams, previousParams) => {
        this.loadSongFromRoute()
      }
    )
  },
  mounted() {
    this.loadSongFromRoute()
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    loadSongFromRoute() {
      const SONG_DETAILS_BY_ID = {
        summertime: summertimeDetails,
        'take-on-me': takeonmeDetails,
      }

      // Fill in song information before instantiating the game
      CO.SONG_ID = this.$route.params.id || 'summertime'
      CO.SONG_DETAILS = SONG_DETAILS_BY_ID[CO.SONG_ID]
      CO.KEYBOARD_TO_PIANO = CO.SONG_DETAILS.keybinding
      CO.NOTES = Object.values(CO.KEYBOARD_TO_PIANO)

      this.song = CO.SONG_DETAILS

      this.cleanup() // Remove old game if this is a reload
      game = new Phaser.Game(config)
    },
    cleanup() {
      if (game) {
        // See: https://stackoverflow.com/a/59617457/1222351
        game.destroy(true, false)
      }
    },
  },
}
</script>
