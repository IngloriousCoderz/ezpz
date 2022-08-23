import { processInput, update, render } from './methods'
import * as time from '../helpers/time'

// @see https://gameprogrammingpatterns.com/game-loop.html

export default {
  nap: loopWithNap,
  elapsed: loopWithElapsed,
  lag: loopWithLag,
}

async function loopWithNap(store, { msPerFrame, shouldQuit }) {
  while (!shouldQuit) {
    const currentTime = Date.now()

    processInput()
    update(store)
    render()

    await time.sleep(Date.now() - currentTime + msPerFrame)
  }
}

async function loopWithElapsed(store, { shouldQuit }) {
  let previousTime = Date.now()

  while (!shouldQuit) {
    const currentTime = Date.now()
    const elapsed = currentTime - previousTime

    processInput()
    await update(store, elapsed)
    render()

    previousTime = currentTime
  }
}

async function loopWithLag(store, { msPerFrame, shouldQuit }) {
  let previousTime = Date.now()
  let lag = 0

  while (!shouldQuit) {
    let currentTime = Date.now()
    const elapsed = currentTime - previousTime
    previousTime = currentTime
    lag += elapsed

    processInput()

    while (lag >= msPerFrame) {
      update(store)
      lag -= msPerFrame
    }

    const normalizedLag = lag / msPerFrame
    await render(normalizedLag)
  }
}
