import { MessageInstance } from "antd/es/message/interface"
import { IDrawableObject } from "./draw"
import SlotLane from "./slotLane"
import { IRessources } from "./ressources"
import drawableMesh from "../openGl/drawableMesh"
import { markGroup } from "./GroupOutline"
import { IGroupData, IResult } from "./canvas"

const GameState = {
  Started: Symbol("started"),
  Lane1: Symbol("lane1"),
  Lane2: Symbol("lane2"),
  Running: Symbol("running"),
  End: Symbol("end"),
}

interface IUpdatableGameObject {
  gameTick(gamedata: SlotGame): void
}

interface IDeletable {
  isDeleted(): boolean
}

class SlotGame {
  groupData: IGroupData[] = []
  lanes: SlotLane[] = []
  sceneObjects: IDrawableObject[] = []
  groupOutline: IDrawableObject[] = []
  time: number = 0
  gameObjects: IUpdatableGameObject[] = []
  deletes: IUpdatableGameObject[] = []
  deleteRquests: [] = []
  gameProceessedFrames = 0
  ressources: IRessources
  result: IResult | null = null
  isProcessing = false

  constructor(ressources: IRessources) {
    this.ressources = ressources

    let backLines = new drawableMesh(ressources.buffer.longLines,
      [],
      ressources.shader.boardColoredLineDottedShader)
    backLines.setColor(ressources.token.colorSlotDarkBorder)
    backLines.setTransparency(true)
    this.sceneObjects.push(backLines)

    let backLinesCross = new drawableMesh(ressources.buffer.longLinesCross,
      [],
      ressources.shader.boardColoredLineShader)
    this.sceneObjects.push(backLinesCross)
    backLinesCross.setTransparency(true)
    backLinesCross.setColor(ressources.token.colorSlotDarkBorder)

    var lane_left: SlotLane | null = null
    const x_positions = [-2.0, 0.0, 2.0];
    for (var i = 0; i < x_positions.length; i++) {
      var singleLane: SlotLane = new SlotLane(x_positions[i], ressources, i, this, lane_left);

      this.lanes.push(singleLane)
      this.gameObjects.push(singleLane)
      lane_left = singleLane
    }

    let colorb = ressources.token.primary.copy()
    colorb.a *= 0.3

    var splitter = new drawableMesh(ressources.buffer.divider,
      [],
      ressources.shader.boardColoredLineShader)
    splitter.setColor(ressources.token.primary)
    splitter.setColorB(colorb)
    splitter.setRenderOrder(2);
    splitter.setTransparency(true)
    splitter.setDepthTest(false)
    splitter.setLocation([0, 0, 0.05])
    this.sceneObjects.push(splitter);

    var splitterDarken = new drawableMesh(ressources.buffer.dividerDarken,
      [],
      ressources.shader.boardColoredLineShader)
    splitterDarken.setColor(ressources.token.colorContrastColor)
    splitterDarken.setColorB(ressources.token.colorContrastColor)
    splitterDarken.setRenderOrder(3);
    splitterDarken.setTransparency(true)
    splitterDarken.setDepthTest(false)
    splitterDarken.setLocation([0, 0, 0.05])
    this.sceneObjects.push(splitterDarken);
  }

  gameloop(time: number) {
    var targetFrame = time / 1000 * 120;
    this.time = time

    while (this.gameProceessedFrames < targetFrame) {
      this.gameObjects.forEach(item => item.gameTick(this))
      if (this.deletes.length > 0)
        this.gameObjects = this.gameObjects.filter(v => this.deletes.indexOf(v) == -1)

      this.gameProceessedFrames++;
    }
  }

  gameClick(): Symbol {
    if (this.isProcessing) {
      return GameState.Running
    }

    if (this.lanes[0].getIsRunning()) {
      this.lanes[0].stop()
      return GameState.Lane1
    }
    else if (this.lanes[1].getIsRunning()) {
      this.lanes[1].stop()
      return GameState.Lane2
    }
    else if (this.lanes[2].getIsRunning()) {
      this.lanes[2].stop()

      let instance = this
      this.groupOutline = []
      setTimeout(function () {
        if (!instance.result)
          return GameState.Running

        instance.groupData.forEach(group => {
          markGroup(instance, instance.ressources, group.value, group, 0.048)
        });

        instance.isProcessing = false
      }, 200);

      this.isProcessing = true

      return GameState.End
    }
    else {
      this.result = null
      
      this.groupOutline.forEach(item => {
        let index = this.sceneObjects.indexOf(item)
        if (index > -1) {
          this.sceneObjects.splice(index, 1);
        }
      });
      this.groupOutline = []

      this.lanes[0].restart()
      this.lanes[1].restart()
      this.lanes[2].restart()
      this.isProcessing = true

      return GameState.Started
    }
  }

  setResult(response: IResult) {
    this.result = response;

    this.lanes[0].setResult(response.result[0])
    this.lanes[1].setResult(response.result[1])
    this.lanes[2].setResult(response.result[2])

    this.groupData = response.groupData

    this.isProcessing = false
  }

  getResult(): IResult {
    return this.result!
  }
}

export { SlotGame, IUpdatableGameObject, IDeletable, GameState }

export default SlotGame