let RATE = 1 // TODO: Rate changes should shift pitches too

// TODO: Does it make sense to use Phaser's built in timeline?
export function makeSeekbar(/** @type {Phaser.Scene} */ scene) {
  // TODO synchronization issues when using these...?
  let start = 0 // Last start in ms
  let pause = 1 // Last pause in ms; begin in paused state
  const songObjs = []
  const playedObjs = []
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
    },
    songObj(hitObj) {
      songObjs.push(hitObj)
    },
    playObj(hitObj) {
      playedObjs.push(hitObj)
    },
    renderObjs() {
      songObjs.forEach((hitObj) => hitObj.render(this.time()))
      playedObjs.forEach((hitObj) => hitObj.render(this.time()))
    },
    pause() {
      pause = scene.time.now

      // Cancel all replays
      for (const hitObj of playedObjs) {
        hitObj.unschedule()
      }
    },
    isPaused() {
      return pause != 0
    },
    // Positive offsetMs = fast forward, negative = rewind
    // If smearMs is set, spread the adjustment over that interval;
    adjust(offsetMs, smearMs = 0) {
      if (smearMs === 0) {
        start -= offsetMs
        return
      }

      const DELAY_MS = 10
      const adjustment = offsetMs / (smearMs / DELAY_MS)
      scene.time.addEvent({
        delay: DELAY_MS,
        repeat: smearMs / DELAY_MS,
        callback: () => (start -= adjustment),
      })
    },
    playConfig() {
      return { seek: this.time() / 1000, rate: RATE }
    },
  }
}