import { Scene } from 'phaser'

export class GameOver extends Scene {
  constructor () {
    super('game-over')
  }

  create () {
    const width = this.scale.width
    const height = this.scale.height

    // set game over text
    this.add.text(width * 0.5, height * 0.2, 'Game Over', {
      fontSize: '48px'
    })
      .setOrigin(0.5)
    // set method to reset the game
    const resetButton = this.add.text(width * 0.5, height * 0.5, 'Try again', {

    })
      .setOrigin(0.5)
      .setPadding(10)
      .setStyle({ backgroundColor: '#111' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => { this.scene.start('mainScene') })
      .on('pointerover', () => resetButton.setStyle({ fill: '#f39c12' }))
      .on('pointerout', () => resetButton.setStyle({ fill: '#FFF' }))
  }
}
