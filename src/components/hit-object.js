let CO

export function passConstants(constants) {
  CO = constants
}

/**
 * hitObj: {
 *   note: 'D' // or 1, or 'F#4'?
 *   hitTime: 12345 // ms, when it should be hit
 *   rect: Phaser.GameObjects.Rectangle ref
 *   render(time) => { adjust rect's position }
 *   hit(time)?? => { replace with score object }
 * }
 */
export function makeHitObject(
  note,
  hitTime,
  /** @type {Phaser.Scene} */ scene,
  color = 0xcccccc,
  alpha = 1
) {
  const rect = scene.add.rectangle(-100, -100, 30, 30, color, alpha)
  rect.setDepth(100)
  // Drag handlers
  rect.setInteractive({ draggable: true })
  rect.on('pointerover', () => (rect.fillColor = 0x34e388))
  rect.on('pointerout', () => (rect.fillColor = color))
  rect.on('dragstart', () => (rect.alpha = 0.7))
  rect.on('drag', (_pointer, dragX, dragY) => hitObject.adjustHitTime(dragY))
  rect.on('dragend', () => (rect.alpha = 1))
  // Delete note on right click
  rect.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown()) {
      // TODO: This doesn't delete from the referencing array
      hitObject.destroy()
    }
  })
  // TODO: Place note on left click

  // Local variables
  let replayEvent
  let seekbarTime = 0
  let deleted = false

  const hitObject = {
    note,
    hitTime,
    rect,
    adjustHitTime(newY) {
      this.hitTime = (CO.TARGET_Y - newY) / CO.FALL_VELOCITY + seekbarTime
      this.resnap()
    },
    render(time) {
      const x = CO.OFFSET_X(note)
      // At hitTime, y should be TARGET_Y
      const y = CO.TARGET_Y - (this.hitTime - time) * CO.FALL_VELOCITY
      rect.setPosition(x, y)
      seekbarTime = time
    },
    // Schedule this note to be replayed when seekbar gets there
    schedule(seekbarTime) {
      const delay = this.hitTime - seekbarTime
      if (delay >= 0) {
        replayEvent = scene.time.addEvent({
          delay,
          callback: () => {
            if (!deleted) {
              CO.SYNTH.triggerAttackRelease(note, '8n')
            }
          },
        })
      }
    },
    unschedule() {
      if (replayEvent) {
        replayEvent.destroy()
      }
    },
    // Returns the serializable version (or undefined if deleted)
    toHit() {
      return deleted ? undefined : { note, time: this.hitTime }
    },
    // Adjust hitTime to land on the specified divisor
    resnap(divisor = 16) {
      const { bpm, offset } = CO.SONG_DETAILS
      const interval = (60 * 1000) / ((bpm * divisor) / 4)
      this.hitTime = nearest(this.hitTime, interval, offset)
    },
    destroy() {
      rect.destroy()
      deleted = true
    },
  }
  return hitObject
}

function nearest(time, interval, offset) {
  const delta = time - offset
  const multiple = Math.round(delta / interval)
  return Math.round(multiple * interval + offset)
}

// TODO: Consider reusing a single guideline instead of making a bunch
export function guideTimes(divisor = 1, max = 100) {
  const { bpm, offset } = CO.SONG_DETAILS
  const interval = (60 * 1000) / ((bpm * divisor) / 4)
  const range = [...Array(max).keys()]
  return range.map((i) => offset + i * interval)
}

export function makeGuideLine(hitTime, /** @type {Phaser.Scene} */ scene) {
  // TODO: these constants should be taken from CO
  const length = CO.SCALE.length * 40
  const skewedCenter = 800 / 2 + 100 - 40 / 2
  const line = scene.add.line(skewedCenter, 0, 0, 0, length, 0, 0xffffff, 0.2)

  return {
    render(time) {
      // At hitTime, y should be TARGET_Y
      const y = CO.TARGET_Y - (hitTime - time) * CO.FALL_VELOCITY
      line.setY(y)
    },
  }
}
