import { GlColor, getRandomArbitrary, stringToRgb } from '../util/SlotsUtil';
import drawableMesh from '../openGl/drawableMesh'
import { IRessources } from './ressources';
import { IDrawableObject } from './draw';
import SlotTile, { ISlotTile } from './SlotTile';
import { SlotGame, IUpdatableGameObject } from './SlotGame';
import { GrowAnimationHandler } from './GroupOutline';
import AnimationHandler from './AnimationHandler';
import HologramTile from './skins/HologramTile';
import { TileSkin } from './skins/SlotThemeConfig';

class SlotLane implements IUpdatableGameObject {
  xLoc: number
  isRunning: boolean
  isStopping: boolean;
  velocity: number;
  targetVelocity: number;
  speedupTime: number;
  speedupFactor: number;
  ressources: IRessources;
  tiles: ISlotTile[];
  finalTiles: ISlotTile[];
  remaining: number | null;
  breakInertia: number;
  number: number;
  lane_left: SlotLane | null;
  arrowLifesycle: number;
  arrowLifesycleDuration: number;
  explosionLifesycleDuration: number;
  starttime: number
  explosionLifecycle: number;
  result: number[];
  isStartet: boolean;

  constructor(xLoc: number, ressources: IRessources, number: number, gameData: SlotGame, lane_left: SlotLane | null) {
    this.xLoc = xLoc
    this.isRunning = true;
    this.isStopping = false;
    this.velocity = 0.0;
    this.targetVelocity = 0.40;
    this.speedupTime = 2.5 * 1000
    this.speedupFactor = this.targetVelocity / Math.pow(this.speedupTime, 2)
    this.ressources = ressources
    this.tiles = []
    this.finalTiles = []
    this.remaining = 0.0;
    this.breakInertia = 0.9
    this.number = number
    this.lane_left = lane_left
    this.arrowLifesycle = 0.0;
    this.arrowLifesycleDuration = 40;
    this.explosionLifesycleDuration = 60;
    this.starttime = 0;
    this.explosionLifecycle = 0;
    this.result = []

    const y_start = -4.0;
    for (var item_nr = 0; item_nr < 5; item_nr++) {
      var y = y_start + item_nr * 2;
      var texId = Math.round(getRandomArbitrary(0, 17));

      let singleTile = ressources.token.tileSkin == TileSkin.Hologram.description ? new HologramTile(ressources, gameData, ressources.gl)
                                                                                  : new SlotTile(ressources, gameData, ressources.gl)

      singleTile.addLocation([xLoc, y, 0]);
      singleTile.texId = texId;
      this.tiles.push(singleTile);
      gameData.sceneObjects.push(singleTile)
    }

    this.finalTiles = this.tiles.slice(1, 4)

    this.isStartet = false;
    this.isRunning = false;
  }

  setHighlight(y: number, color: GlColor, fadeInDuration: number) {
    if (this.finalTiles.length > 0) {
      this.finalTiles[y].setHighlight(color, fadeInDuration)
    }
  }

  break() {
    this.velocity = this.breakInertia * this.velocity + (1 - this.breakInertia) * this.remaining!
    this.remaining! -= this.velocity;

    var vec3Shift: [number, number, number] = [0.0, -this.velocity, 0.0]
    this.tiles.forEach(singleTile => {
      singleTile.addLocation(vec3Shift);
      singleTile.setShaderPara1(0.0)
    })
  }

  gameTick(gamedata: SlotGame): void {
    let time = gamedata.time

    if (!this.isStartet) {
      return;
    }

    if (!this.isRunning) {
      this.break();
      return;
    }

    if (this.starttime == 0) 
      this.starttime = time

    if (time > (this.starttime + this.speedupTime) && (this.lane_left == undefined || !this.lane_left.isRunning)) {
      this.arrowLifesycle = Math.min(this.arrowLifesycle + (1.0 / this.arrowLifesycleDuration), 1.0)
    }

    var ofsett_time = Math.max(time - this.starttime - this.number * 200, 0.0);
    this.velocity = Math.min(this.speedupFactor * Math.pow(ofsett_time, 2), 0.4)
    if (this.remaining) {
      if (this.velocity < this.remaining) {
        this.remaining -= this.velocity
      }
      else {
        this.velocity = this.remaining
        this.remaining = 0
        this.isRunning = false

        this.finalTiles.forEach((tile, i) => {
          tile.performStopAnimation(i);
        })
      }
    }
    this.move();
    if (this.isRunning === false) {
      this.velocity = 0.2
    }
  }

  move() {
    var ressources = this.ressources
    var vec3Shift: [number, number, number] = [0.0, -this.velocity, 0.0]
    this.tiles.forEach(singleTile => {
      singleTile.addLocation(vec3Shift);
      if (singleTile.getLocation()[1] < -4.5) {
        singleTile.addLocation([0.0, 10.0, 0.0]);

        var texId: number;
        if (this.finalTiles.includes(singleTile)) {
          texId = this.result.pop()!
        }
        else {
          texId = Math.round(getRandomArbitrary(0, 17));
        }
        singleTile.setShaderPara1(Math.pow(this.velocity / this.targetVelocity, 3))

        singleTile.setIconId(texId);

      }
    })
  }

  stop() {
    if (this.isStopping) {
      return
    }

    if (this.velocity != this.targetVelocity) {
      return;
    }

    this.finalTiles = this.tiles.sort(function (a, b) { return a.getLocation()[1] - b.getLocation()[1] }).slice(0, 3)
    this.remaining = this.finalTiles[0].getLocation()[1] + 10.0 + 2.0
    this.isStopping = true
  }

  getIsRunning() {
    return this.isRunning;
  }

  restart() {
    this.starttime = 0;
    this.isRunning = true;
    this.finalTiles = []
    this.remaining = null;
    this.explosionLifecycle = 0;
    this.isStopping = false
    this.isStartet = true

    this.tiles.forEach(item => {
      item.reset()
    })
  }

  setResult(result: number[]) {
    this.result = result
    this.result.reverse()
  }
}



export default SlotLane;