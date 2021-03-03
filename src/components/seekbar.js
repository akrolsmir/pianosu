let RATE = 1 // TODO: Rate changes should shift pitches too

// TODO: Does it make sense to use Phaser's built in timeline?
export function makeSeekbar(/** @type {Phaser.Scene} */ scene) {
  // TODO synchronization issues when using these...?
  let start = 0 // Last start in ms
  let pause = 1 // Last pause in ms; begin in paused state
  const songObjs = []
  const playedObjs = []

  const BAR = scene.add.rectangle(0, 560, 800, 40, 0x002244, 0.5).setOrigin(0)

  const SEEK_TEXT = scene.add.text(10, 572, '')
  const INSTRUCTION_TEXT = scene.add.text(560, 572, 'Press "P" to play')

  return {
    time() {
      // TODO: prevent rewinding past 0 with Math.max(0, ...)?
      return ((pause || scene.time.now) - start) * RATE
    },
    textTime() {
      // Format as "MM:SS.mmm"
      const nice = (f, lead) => `${Math.floor(f)}`.padStart(lead, '0')
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
    exportPlayed() {
      return playedObjs.map((hitObj) => hitObj.toHit())
    },
    resnapPlayed() {
      playedObjs.forEach((hitObj) => hitObj.resnap())
    },
    renderObjs() {
      songObjs.forEach((hitObj) => hitObj.render(this.time()))
      playedObjs.forEach((hitObj) => hitObj.render(this.time()))

      SEEK_TEXT.text = this.textTime()
    },
    pause() {
      pause = scene.time.now

      // Cancel all replays
      for (const hitObj of playedObjs) {
        hitObj.unschedule()
      }

      INSTRUCTION_TEXT.text = 'Press "P" to resume'
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

      const DELAY_MS = 10
      const adjustment = offset / (smearMs / DELAY_MS)
      scene.time.addEvent({
        delay: DELAY_MS,
        // `repeat: n` will trigger n + 1 events
        repeat: smearMs / DELAY_MS - 1,
        callback: () => (start -= adjustment),
      })
    },
    playConfig() {
      return { seek: this.time() / 1000, rate: RATE }
    },
  }
}
