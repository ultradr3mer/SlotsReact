import { SlotGame, IUpdatableGameObject } from "./SlotGame";

abstract class AnimationHandler implements IUpdatableGameObject
{
  lifecycleState: number = 0
  durationTicks: number = 40

  constructor(gamedata: SlotGame) {
    gamedata.gameObjects.push(this)
  }

  startDelayed(ms: number) {
    let func = () => this.start()

    setTimeout(function () {
      func()
    }, ms);
  }
  
  start() {
    this.lifecycleState = 0
  }

  gameTick(gamedata: SlotGame): void {
    if(this.lifecycleState == 1)
    {
      return;
    }

    this.lifecycleState = Math.min(1.0, this.lifecycleState += 1 / this.durationTicks)

    this.handleAnimation(this.lifecycleState)
  }
  
  abstract handleAnimation(lifecycleState: number): void
}

export default AnimationHandler


