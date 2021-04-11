<template>
  <h2>Pianosu: {{ song.name }} by {{ song.artist }}</h2>
  <div id="gameDiv" style="margin: 0 auto" @click="defocusInputs"></div>
  Press [Space] to play or pause; [R] to rewind; [T] to fast-forward.<br />
  [Q] to snap notes to the beat; [W] to clear unplayed notes.
  <EditorPane
    v-if="editMode"
    :getPlayedNotes="getPlayedNotes"
    :song="song"
    :track="track"
  />
  <SongsList />
</template>

<script>
// Demo copied from https://github.com/photonstorm/phaser3-examples/blob/master/public/src/input/multitouch/multi%20touch%20test.js
import Phaser from 'phaser'
import * as Tone from 'tone'
import { passConstants, makeHitObject } from './hit-object.js'
import { makeSeekbar } from './seekbar.js'
import { getSong, getTrack } from './network'
import SongsList from './SongsList.vue'
import EditorPane from './EditorPane.vue'

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
  disableContextMenu: true,
  parent: 'gameDiv',
}

// Global config and constants
const CO = {
  // Same for all songs
  /** @type {Phaser.Scene} */ SCENE: undefined,
  /** @type {Tone.PolySynth} */ SYNTH: undefined,
  FALL_VELOCITY: 333 / 1000, // px/ms
  TARGET_Y: 420,
  OFFSET_X: (note) => CO.SCALE.indexOf(note) * 40 + skewedCenter(CO.SCALE),
  SEEKBAR: {},

  // Changes between songs
  SONG_ID: undefined,
  SONG_DETAILS: undefined,
  KEYBOARD_TO_PIANO: undefined,
  SCALE: undefined,
}

function skewedCenter(scale) {
  return config.width / 2 - (scale.length / 2) * 40 + 100
}

// Time is msecs, delta is time since last update
function update(_time, _delta) {
  CO.SEEKBAR.renderObjs()

  checkShouldEnableInput(this)
}

// Disable key capture when an input is selected.
// Courtesy of igloo.chat https://github.com/harvestzhang/igloochat/blob/910d5f6ac4573b84fa802ef3cbd94d8ab3fc0351/src/services/MainScene.js#L537
function checkShouldEnableInput(/** @type {Phaser.Scene} */ scene) {
  const activeTag = document.activeElement.tagName
  if (activeTag === 'INPUT') {
    scene.input.keyboard.disableGlobalCapture()
    scene.input.keyboard.enabled = false
    scene.input.keyboard.resetKeys()
  } else {
    if (activeTag !== 'BODY') document.activeElement.blur()
    scene.input.keyboard.enableGlobalCapture()
    scene.input.keyboard.enabled = true
  }
}

// Note: Preload doesn't like being async, so we getDownloadUrl beforehand
function preload() {
  /** @type {Phaser.Scene} */
  const scene = this
  const loadingText = scene.add.text(10, 572, 'Loading...')
  scene.load.setPath('/assets/piano')
  scene.load.audio(CO.SONG_ID, CO.SONG_DETAILS.audio)
  scene.load.image('bgImage', CO.TRACK.bgImage)
  scene.load.on('complete', () => loadingText.destroy())
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
  const bg = scene.add.image(config.width / 2, config.height / 2, 'bgImage')
  bg.scale = fit(bg.width, bg.height, config.width, config.height)
  const darken = scene.add
    .rectangle(0, 0, config.width, config.height, 0x000000, 0.4)
    .setOrigin(0) // Set origin to (0, 0) instead of rect center

  this.createPiano()

  // Init seekbar
  CO.SEEKBAR = makeSeekbar(this)

  // Initialize the hit objects for this song
  passConstants(CO)
  for (const { note, time } of CO.TRACK.notes) {
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
        const time = Math.round(CO.SEEKBAR.time()) // <0.5ms shift is not detectable
        CO.SEEKBAR.playObj(makeHitObject(note, time, this, 0x66aacc))
      }
    })
  }

  // Play controls
  const playKey = scene.input.keyboard.addKey('SPACE')
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

  // Resnap all notes
  scene.input.keyboard.addKey('Q').on('down', () => {
    CO.SEEKBAR.resnapPlayed()
  })

  // Clear notes after current time
  scene.input.keyboard.addKey('W').on('down', () => {
    CO.SEEKBAR.clearPlayed(CO.SEEKBAR.time())
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

  // When mouse wheel scrolls down or up, adjust time by +/- 1 sec
  scene.input.on('wheel', (_pointer, _currentlyOver, _dx, dy, _dz, _event) => {
    if (!CO.SEEKBAR.isPaused()) {
      music.pause()
      CO.SEEKBAR.pause()
    }
    let adjustment = dy && (dy > 0 ? 1000 : -1000)
    CO.SEEKBAR.adjust(adjustment, 100)
  })

  function addHitEffect(note) {
    const x = CO.OFFSET_X(note)
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
    if (!keyCode) {
      return
    }

    // FWIW: x=0 y=0 CENTERS the line at 0,0? then x1,y1,x2,y2 define the line

    const x = CO.OFFSET_X(note)
    const y = CO.TARGET_Y

    // Narrow rails
    scene.add.line(0, 0, x - 20, 0, x - 20, CO.TARGET_Y * 4, 0xaaccee, 0.2)
    scene.add.line(0, 0, x + 20, 0, x + 20, CO.TARGET_Y * 4, 0xaaccee, 0.2)

    // White type box target
    scene.add.text(x - 10, y - 15, keylabel(keyCode), { font: '32px' })
    const r = scene.add.rectangle(x, y, 32, 32)
    r.setStrokeStyle(2, 0xaaaaaa, 1)
  }
}

let game

export default {
  components: {
    SongsList,
    EditorPane,
  },
  data() {
    return {
      song: {},
      track: {},
      editMode: false,
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
    defocusInputs() {
      document.activeElement.blur()
    },
    async loadSongFromRoute() {
      this.editMode = this.$route.meta.editMode
      // Fill in song information before instantiating the game
      const songId = this.$route.params.id || 'test'
      const trackId = this.$route.params.track || 'piano'
      const [song, track] = await Promise.all([
        getSong(songId),
        getTrack(songId, trackId),
      ])
      this.loadSong(song, track)
    },
    loadSong(song, track) {
      this.song = song
      this.track = track
      CO.SONG_DETAILS = song
      CO.SONG_ID = song.id

      CO.TRACK = track

      CO.KEYBOARD_TO_PIANO = objectify(CO.TRACK.keys, CO.TRACK.scale)
      CO.SCALE = track.scale || []

      this.cleanup() // Remove old game if this is a reload
      game = new Phaser.Game(config)
    },
    cleanup() {
      if (game) {
        // See: https://stackoverflow.com/a/59617457/1222351
        game.destroy(true, false)
      }
    },
    getPlayedNotes() {
      return CO.SEEKBAR.exportPlayed ? CO.SEEKBAR.exportPlayed() : []
    },
  },
}

function objectify(keys, values) {
  // Assumes keys.length === values.length
  return Object.fromEntries(keys.map((k, i) => [k, values[i]]))
}
</script>
