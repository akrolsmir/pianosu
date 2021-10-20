import { guideTimes, makeGuideLine, makeHitObject } from './hit-object'

let RATE = 1 // TODO: Rate changes should shift pitches too

// TODO: Does it make sense to use Phaser's built in timeline?
export function makeSeekbar(/** @type {Phaser.Scene} */ scene) {
  // TODO synchronization issues when using these...?
  let start = 0 // Last start in ms
  let pause = 1 // Last pause in ms; begin in paused state
  const songObjs = []
  let playedObjs = []
  let guideLines = []

  const BAR = scene.add.rectangle(0, 560, 800, 40, 0x002244, 0.5).setOrigin(0)

  const SEEK_TEXT = scene.add.text(10, 572, '')
  const INSTRUCTION_TEXT = scene.add.text(560, 572, 'Press [Space] to play')

  return {
    time() {
      // TODO: prevent rewinding past 0 with Math.max(0, ...)?
      return ((pause || scene.time.now) - start) * RATE
    },
    textTime() {
      // Format as "MM:SS.mmm"
      const nice = (f, lead) =>
        `${Math.max(Math.floor(f), 0)}`.padStart(lead, '0')
      const min = nice(Math.floor(this.time() / 1000 / 60), 2)
      const sec = nice((this.time() / 1000) % 60, 2)
      const msec = nice((this.time() % 1000) - 1, 3)
      return `${min}:${sec}.${msec}`
    },
    resume() {
      const pausedTime = scene.time.now - pause
      start += pausedTime
      pause = 0

      // Schedule each PLAYED_OBJ for replay
      for (const hitObj of playedObjs) {
        hitObj.schedule(this.time())
      }

      INSTRUCTION_TEXT.text = ''
    },
    songObj(hitObj) {
      songObjs.push(hitObj)
    },
    playObj(hitObj) {
      playedObjs.push(hitObj)
    },
    mirrorSongToPlayed() {
      // First, clear out all playedObjs
      playedObjs.forEach((hitObj) => hitObj.destroy())
      // Then copy all songObjs into playedObjs
      for (const hitObj of songObjs) {
        this.playObj(
          makeHitObject(hitObj.note, hitObj.hitTime, scene, 0x66aacc)
        )
      }
    },
    makeGuideLines() {
      guideLines = guideTimes().map((time) => makeGuideLine(time, scene))
    },
    exportPlayed() {
      return playedObjs.map((hitObj) => hitObj.toHit()).filter(Boolean)
    },
    resnapPlayed() {
      playedObjs.forEach((hitObj) => hitObj.resnap())
    },
    clearPlayed(afterMs = 0) {
      playedObjs
        .filter((hitObj) => hitObj.hitTime >= afterMs)
        .forEach((hitObj) => hitObj.destroy())
    },
    renderObjs() {
      songObjs.forEach((hitObj) => hitObj.render(this.time()))
      playedObjs.forEach((hitObj) => hitObj.render(this.time()))
      guideLines.forEach((line) => line.render(this.time()))

      SEEK_TEXT.text = this.textTime()
    },
    pause() {
      pause = scene.time.now

      // Cancel all replays
      for (const hitObj of playedObjs) {
        hitObj.unschedule()
      }

      INSTRUCTION_TEXT.text = 'Press [Space] to resume'
    },
    isPaused() {
      return pause != 0
    },
    // Positive offsetMs = fast forward, negative = rewind
    // If smearMs is set, spread the adjustment over that interval
    adjust(offsetMs, smearMs = 0) {
      // Don't rewind beyond 0ms
      const offset = Math.max(-this.time(), offsetMs)
      if (smearMs === 0) {
        start -= offset
        return
      }

      // Note: The phaser timer seems to runs slower than wall-clock;
      // The shorter your delay (eg 5ms), the slower these events fire.
      // Also: rapid-fire adjustments won't stack correctly (eg rapid mousewheel)
      const DELAY_MS = 15
      const repeats = Math.round(smearMs / DELAY_MS)
      const adjustment = offset / repeats
      scene.time.addEvent({
        delay: DELAY_MS,
        // `repeat: n` will trigger n + 1 events
        repeat: repeats - 1,
        // Only adjust while audio is paused
        callback: () => (start -= this.isPaused() ? adjustment : 0),
      })
    },
    playConfig() {
      return { seek: this.time() / 1000, rate: RATE }
    },
    complete() {
      INSTRUCTION_TEXT.text = 'Hit [Enter] to play back'
    },
  }
}
