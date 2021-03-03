<template>
  <h2>Pianosu: {{ song.title }} by {{ song.artist }}</h2>
  <div id="gameDiv" style="margin: 0 auto"></div>
  Press "P" to play or pause; "R" to rewind; "T" to fast-forward.
  <SongsList />
</template>

<script>
// Demo copied from https://github.com/photonstorm/phaser3-examples/blob/master/public/src/input/multitouch/multi%20touch%20test.js
import Phaser from 'phaser'
import * as Tone from 'tone'
import { summertimeDetails } from '../songs/summertime'
import { takeonmeDetails } from '../songs/take-on-me'
import { passConstants, makeHitObject } from './hit-object.js'
import { makeSeekbar } from './seekbar.js'
import SongsList from './SongsList.vue'

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    key: 'main-scene',
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
  FALL_VELOCITY: 333 / 1000, // px/ms
  TARGET_Y: 420,
  SEEKBAR: {},

  // Changes betwen songs
  SONG_ID: undefined,
  SONG_DETAILS: undefined,
  KEYBOARD_TO_PIANO: undefined,
  NOTES: undefined,
}

// Time is msecs, delta is time since last update
function update(_time, _delta) {
  CO.SEEKBAR.renderObjs()
}

function preload() {
  this.load.setPath('/assets/piano')
  this.load.atlas('piano', 'piano.png', 'piano.json')
  this.load.audio(CO.SONG_ID, CO.SONG_DETAILS.soundFile)
  this.load.image('backgroundImage', CO.SONG_DETAILS.backgroundImage)
}

// Return the scaling factor that makes an object sized (x, y)
// cover-fit into the target (no letterboxing)
function fit(x, y, targetX, targetY) {
  return Math.max(targetX / x, targetY / y)
}

function create() {
  /** @type {Phaser.Scene} */
  const scene = this

  // Draw and darken the background
  const bg = scene.add.image(
    config.width / 2,
    config.height / 2,
    'backgroundImage'
  )
  bg.scale = fit(bg.width, bg.height, config.width, config.height)
  const darken = scene.add
    .rectangle(0, 0, config.width, config.height, 0x000000, 0.4)
    .setOrigin(0) // Set origin to (0, 0) instead of rect center

  this.createPiano()

  // Init seekbar
  CO.SEEKBAR = makeSeekbar(this)

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
          makeHitObject(note, CO.SEEKBAR.time(), this, 0x66aacc)
        )
      }
    })
  }

  // Play controls
  const playKey = scene.input.keyboard.addKey('P')
  const music = scene.sound.add(CO.SONG_ID, { volume: 0.3 })
  playKey.on('down', () => {
    if (CO.SEEKBAR.isPaused()) {
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
    if (!CO.SEEKBAR.isPaused()) {
      music.pause()
      CO.SEEKBAR.pause()
    }
    CO.SEEKBAR.adjust(-2000, 200)
  })

  // Fast forward by 2 sec
  const ffKey = scene.input.keyboard.addKey('T')
  ffKey.on('down', async () => {
    if (!CO.SEEKBAR.isPaused()) {
      music.pause()
      CO.SEEKBAR.pause()
    }
    CO.SEEKBAR.adjust(2000, 200)
  })

  function addHitEffect(note) {
    const x = CO.NOTES.indexOf(note) * 85 + 35 + 25
    const y = CO.TARGET_Y
    const rect = scene.add.rectangle(x, y, 30, 30, 0x66aacc)
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
    // TODO: Hide these to get an awesome chromeless version
    scene.add.rectangle(x, y, 55, 55, 0x66aaee, 0.5)
    scene.add.text(x - 10, y - 15, keylabel(keyCode), { font: '32px' })
    scene.add.line(0, 0, x - 42, 0, x - 42, CO.TARGET_Y * 2 + 50, 0xaaccee, 0.4)
    scene.add.line(0, 0, x + 42, 0, x + 42, CO.TARGET_Y * 2 + 50, 0xaaccee, 0.4)
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
