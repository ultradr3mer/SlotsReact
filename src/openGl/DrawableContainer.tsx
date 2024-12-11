import { IDrawContext, IDrawableObject } from "../canvas/draw"

class DrawableContainer {
  private isVisible: boolean

  elements: IDrawableObject[] = []
  renderOrder: number = 0
  location: [number, number, number]

  constructor(elements: IDrawableObject[]) {
    this.elements = elements
    this.isVisible = true
    this.location = [0, 0, 0]
  }

  setShaderPara1(value: number) {
    this.elements.forEach(element => {
      element.setShaderPara1(value)
    });
  }

  addLocation(loc: [number, number, number]) {
    this.location[0] += loc[0];
    this.location[1] += loc[1];
    this.location[2] += loc[2];
    this.elements.forEach(element => {
      element.addLocation(loc)
    });
  }

  setLocation(location: [number, number, number]) {
    this.location = [...location]
    this.elements.forEach(element => {
      element.setLocation(location)
    });
  }

  getLocation()
  {
    return this.location;
  }

  setVisible(value: boolean) {
    this.isVisible = true
  }

  setRenderOrder(value: number) {
    this.renderOrder = value
  }

  getRenderOrder() {
    return this.renderOrder
  }

  draw(context: IDrawContext) {
    if(!this.isVisible)
    {
      return;
    }

    this.elements.forEach(element => {
      element.draw(context)
    });
  }
}

export default DrawableContainer