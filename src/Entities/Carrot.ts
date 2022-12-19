import { GameObjects, Scene } from 'phaser'

export class Carrot extends GameObjects.Sprite {
  constructor (scene:Scene, x:number, y:number, texture:string) {
    super(scene, x, y, texture)

    this.setScale(0.5)
  }
}
